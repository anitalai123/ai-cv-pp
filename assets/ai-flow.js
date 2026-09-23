/* The option 1 AI feedback branch: profile -> job title -> (we need more about
   you) -> AI feedback. Shared by the pages in that branch. */

/* The sections AI feedback draws on, besides the personal profile itself. */
const AI_SECTIONS = [
  { id: 'workHistory', name: 'Work history', href: 'work-history.html' },
  { id: 'skills', name: 'Skills', href: 'skills.html' },
  { id: 'education', name: 'Education and training', href: 'education-info.html' },
  { id: 'additionalInfo', name: 'Add custom section', href: 'additional-info.html' },
];

/* Mirrors the task list: a section counts as done when it actually holds
   something, and an empty array is truthy so it has to be checked explicitly. */
function sectionHasContent(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}

function outstandingSections() {
  const state = Store.read();
  return AI_SECTIONS.filter(function (section) {
    return !sectionHasContent(state[section.id]);
  });
}

/* Where to go once the job title is known: straight to the feedback when every
   section is filled in, otherwise via the nudge page. */
function afterJobTitle() {
  return outstandingSections().length ? 'more-about-you.html' : 'ai-feedback.html';
}

/* ------------------------------------------------------------- feedback */

/* Feedback comes from /api/feedback, which asks Claude. The response is kept in
   sessionStorage so the edit pages show the same items the accordion did without
   asking again - and so a reload does not spend another request. Store.clear on
   the cover page does not touch it; requestFeedback drops it whenever the
   profile or job title it was written about has changed. */
function feedbackKey(option) {
  return 'build-a-cv-feedback-' + (option || window.protoOption);
}

function cachedFeedback() {
  try {
    return JSON.parse(sessionStorage.getItem(feedbackKey()));
  } catch (e) {
    return null;
  }
}

/* What the feedback was written about. Different answers, different feedback. */
function feedbackSubject(state) {
  return JSON.stringify([state.profile || '', state.jobTitle || '']);
}

function requestFeedback() {
  const state = Store.read();
  const subject = feedbackSubject(state);
  const cached = cachedFeedback();

  if (cached && cached.subject === subject) {
    return Promise.resolve(cached.feedback);
  }

  return fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: state.profile || '',
      jobTitle: state.jobTitle || '',
      workHistory: state.workHistory || [],
      education: state.education || [],
      skills: state.skills || [],
      additionalInfo: state.additionalInfo || [],
    }),
  }).then(function (response) {
    return response.json().then(function (body) {
      if (!response.ok) throw new Error(body.error || 'Feedback failed');
      return body;
    });
  }).then(function (feedback) {
    feedback.items = (feedback.items || []).slice(0, 5);
    try {
      sessionStorage.setItem(feedbackKey(), JSON.stringify({ subject: subject, feedback: feedback }));
    } catch (e) {}
    return feedback;
  });
}

/* Shown when the API is not reachable - no key set, or offline - so the pages
   can still be walked through in a demo. */
const PLACEHOLDER_SUMMARY = 'Your profile gives a clear sense of your experience, ' +
  'but it is doing less than it could to connect that experience to the job you are ' +
  'going for. The points below would make it stronger.';

const PLACEHOLDER_ITEMS = [
  {
    title: 'Name the job you are going for',
    details: 'Your profile does not say what kind of role you want. Employers read this ' +
      'section first, so open with the job title or field you are applying in.',
  },
  {
    title: 'Back up your skills with evidence',
    details: 'You describe yourself as organised and reliable, but there is nothing here ' +
      'that shows it. Point to something you did and what came of it.',
  },
  {
    title: 'Cut the filler phrases',
    details: '"Hard working team player" appears in most profiles, so it tells an employer ' +
      'nothing about you. Use the space for something only you could write.',
  },
  {
    title: 'Mention your most recent experience',
    details: 'Your profile stops at work you did some years ago. Bring it up to date so it ' +
      'matches the work history you have entered.',
  },
  {
    title: 'Shorten your opening sentence',
    details: 'The first sentence runs to more than 40 words, which is hard to take in. ' +
      'Splitting it in two would make your strongest point land.',
  },
];

const PLACEHOLDER_FEEDBACK = { summary: PLACEHOLDER_SUMMARY, items: PLACEHOLDER_ITEMS };

/* 1-based, from ?n= on the edit page, clamped to the feedback that exists. */
function feedbackIndex(total) {
  let n = 1;
  try {
    n = parseInt(new URLSearchParams(window.location.search).get('n'), 10) || 1;
  } catch (e) {}
  return Math.min(Math.max(n, 1), total);
}
