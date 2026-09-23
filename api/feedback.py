"""AI feedback on a personal profile.

Runs as a Vercel Python serverless function at /api/feedback, and is imported by
serve.py so local development hits exactly the same code. The API key is read
from the environment and never leaves the server - the browser only ever sees
the finished feedback.
"""

import json
import os
from http.server import BaseHTTPRequestHandler

import anthropic

MODEL = 'claude-opus-5'
MAX_ITEMS = 5

SYSTEM = """You are an experienced careers adviser working for a UK employment
service. You are reviewing the personal profile section of someone's CV - the
short summary at the top that says who they are and what they are looking for.

Write the way a good adviser talks to someone across a desk: warm, direct, and
practical. You are helping a real person who may have been out of work for a
while, so never be sneering or discouraging about what they have written.

How to choose what to say:
- Give at most %d pieces of feedback, and fewer when fewer are warranted. Only
  raise something if acting on it would genuinely make an employer more likely
  to call this person. Order them with the highest value change first.
- Ground every point in what the person has actually told us. Their work
  history, gaps, education, skills and any custom sections are given to you -
  use them to suggest concrete things they could say about themselves, rather
  than inventing experience they have not claimed.
- Point at the specific part of the profile you mean, quoting a few words from
  it, so they can find it. If your point is about something missing rather than
  something written, say where it should go.
- Say what to do, not just what is wrong. Someone should be able to act on each
  point without having to ask what you meant.
- A point is a "must change" only when leaving it would actively cost them
  interviews: the profile is empty or nearly so, it contradicts their work
  history, it is far too long or short, or it says nothing about the job they
  are going for. Ordinary improvements are not must changes, and it is normal
  for none to be.

How to write:
- Plain English, the way you would say it out loud. Short sentences. No jargon,
  no CV-industry cliches, no management-speak.
- Address the person directly as "you".
- The title of each point is a short instruction, at most 8 words, in sentence
  case with no full stop.
- The detail is 1 to 3 sentences.
- The summary is 2 or 3 sentences giving your overall read of the profile.
  Start with what is working before what is not.""" % MAX_ITEMS

SCHEMA = {
    'type': 'object',
    'properties': {
        'summary': {
            'type': 'string',
            'description': 'Overall read of the profile, 2 to 3 sentences.',
        },
        'items': {
            'type': 'array',
            # structured outputs rejects maxItems, so the cap lives in the
            # prompt and is enforced again when the response comes back 
            'items': {
                'type': 'object',
                'properties': {
                    'title': {
                        'type': 'string',
                        'description': 'Short instruction, at most 8 words.',
                    },
                    'details': {
                        'type': 'string',
                        'description': 'What to do and where, 1 to 3 sentences, '
                                       'quoting the part of the profile it is about.',
                    },
                    'mustChange': {
                        'type': 'boolean',
                        'description': 'True only when leaving this would actively '
                                       'cost them interviews.',
                    },
                },
                'required': ['title', 'details', 'mustChange'],
                'additionalProperties': False,
            },
        },
    },
    'required': ['summary', 'items'],
    'additionalProperties': False,
}


MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def _month_year(month, year):
    """"Mar 2023", falling back to whatever was actually typed."""
    try:
        name = MONTHS[int(month) - 1]
    except (TypeError, ValueError, IndexError):
        name = month or ''
    return ' '.join(x for x in [name, year] if x)


def _date_range(item):
    start = _month_year(item.get('startMonth'), item.get('startYear'))
    if item.get('current'):
        return (start + ' to present').strip()
    end = _month_year(item.get('endMonth'), item.get('endYear'))
    return ' to '.join(x for x in [start, end] if x)


def _work_history(items):
    lines = []
    for item in items or []:
        if item.get('type') == 'gap':
            lines.append('- Gap: %s (%s). %s' % (
                item.get('gapTitle') or 'Untitled',
                _date_range(item) or 'no dates',
                item.get('summary') or '',
            ))
            continue
        lines.append('- Job: %s at %s (%s)' % (
            item.get('jobTitle') or 'Untitled',
            item.get('employer') or 'unnamed employer',
            _date_range(item) or 'no dates',
        ))
        for duty in item.get('responsibilities') or []:
            lines.append('    responsibility: %s' % duty)
    return '\n'.join(lines)


def _education(items):
    lines = []
    for item in items or []:
        subjects = ', '.join(
            '%s (%s)' % (s.get('subject'), s.get('grade')) if s.get('grade') else s.get('subject')
            for s in item.get('subjects') or []
        )
        lines.append('- %s at %s%s' % (
            item.get('courseType') or 'Qualification',
            item.get('institution') or 'unnamed institution',
            ': ' + subjects if subjects else '',
        ))
    return '\n'.join(lines)


def _sections(items):
    return '\n'.join(
        '- %s: %s' % (item.get('title') or 'Untitled', item.get('details') or '')
        for item in items or []
    )


def build_prompt(data):
    """Everything the person has told us, as one readable brief."""
    profile = (data.get('profile') or '').strip()
    job_title = (data.get('jobTitle') or '').strip()
    skills = [s for s in (data.get('skills') or []) if s]

    parts = ['Here is what this person has told us about themselves.\n']
    parts.append('JOB THEY ARE GOING FOR\n%s\n' % (job_title or 'Not given.'))
    parts.append('THEIR PERSONAL PROFILE, AS WRITTEN\n%s\n' % (profile or '(They have not written anything yet.)'))
    parts.append('WORK HISTORY AND GAPS\n%s\n' % (_work_history(data.get('workHistory')) or 'Nothing entered.'))
    parts.append('EDUCATION AND TRAINING\n%s\n' % (_education(data.get('education')) or 'Nothing entered.'))
    parts.append('SKILLS\n%s\n' % ('\n'.join('- ' + s for s in skills) or 'Nothing entered.'))
    parts.append('OTHER SECTIONS THEY ADDED\n%s\n' % (_sections(data.get('additionalInfo')) or 'Nothing entered.'))
    parts.append('Give your feedback on the personal profile.')
    return '\n'.join(parts)


def feedback(data):
    """Ask Claude for feedback. Raises RuntimeError when the key is missing."""
    if not os.environ.get('ANTHROPIC_API_KEY'):
        raise RuntimeError('ANTHROPIC_API_KEY is not set')

    client = anthropic.Anthropic()
    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=SYSTEM,
        thinking={'type': 'adaptive'},
        output_config={'format': {'type': 'json_schema', 'schema': SCHEMA}},
        messages=[{'role': 'user', 'content': build_prompt(data)}],
    )

    text = next(block.text for block in response.content if block.type == 'text')
    result = json.loads(text)
    result['items'] = result.get('items', [])[:MAX_ITEMS]
    return result


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length') or 0)
        try:
            data = json.loads(self.rfile.read(length) or b'{}')
        except ValueError:
            self._send(400, {'error': 'Could not read the request'})
            return

        try:
            self._send(200, feedback(data))
        except RuntimeError as error:
            # the front end falls back to its placeholder feedback
            self._send(503, {'error': str(error)})
        except Exception as error:
            self._send(502, {'error': type(error).__name__ + ': ' + str(error)})

    def _send(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
