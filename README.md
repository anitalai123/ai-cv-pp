# Build a CV — prototype

A static rebuild of the GOV.UK Work Hub "Build a CV" task list and Personal profile
flow, as a baseline for designing AI feedback on the Personal profile.

## Running it

```
python3 serve.py
```

Then open http://localhost:8123. Pass a port to use a different one
(`python3 serve.py 8080`). Opening the HTML files directly in a browser also
works — nothing depends on a server.

To get real AI feedback locally, install the SDK and give the server a key:

```
pip3 install --user -r requirements.txt
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
```

`--user` installs into your home directory, so it needs no sudo. On macOS's
system Python 3.9 this resolves to `anthropic` 0.125.x rather than 1.x, which
needs Python 3.10 or newer; 0.125 supports everything `api/feedback.py` uses.
Vercel's Python runtime is newer and installs 1.x.

`.env` is gitignored, and `serve.py` reads it at startup - so restart the server
after creating it. Without a key the prototype still works: the feedback page
shows example feedback and says so.

`serve.py` is the stock Python static server with caching turned off. Plain
`python3 -m http.server` sends no `Cache-Control` header, so browsers fall back
to heuristic caching and keep serving an edited `assets/*.js` or `styles.css`
from disk — edits appear not to land until a hard reload. This sends
`no-store`, so an ordinary reload always picks up the latest edit. Local
development only: the deployed site is served by Vercel.

## Pages

| File | Mirrors | Notes |
| --- | --- | --- |
| `password.html` | — | Prototype password gate. The password is `star`. |
| `index.html` | — | Prototype cover page. Prototype caveats, then an entry button and its own Reset button per option. Not a page from the live service. |
| `task-list.html` | `/cv/create/task-list` | Three sections, statuses derived from saved answers. |
| `profile-info.html` | `/cv/create/profile/info` | Guidance page, including the "If you are using AI to help you" details. |
| `profile.html` | `/cv/create/profile` | Character-counted textarea. **This is where AI feedback goes** — see the `<!-- AI feedback will go here -->` marker. |
| `work-history.html` | `/cv/create/work-history` | What can be included, and the two ways in. |
| `work-history-info.html` | `/cv/create/work-history/info` | Guidance before adding a job. |
| `work-history-job.html` | dynamic route | Job title, employer, dates, "are you at this job now". |
| `work-history-responsibilities.html` | dynamic route | Repeatable responsibilities, 1,500 characters each. |
| `work-history-review.html` | `/cv/create/work-history/review` | Summary cards for jobs and gaps, with Change and Remove. |
| `work-history-gaps-info.html` | `/cv/create/work-history/gaps/info` | Guidance before adding a gap. |
| `work-history-gaps.html` | `/cv/create/work-history/gaps` | Title, dates and a summary of the gap. |
| `education-info.html` | `/cv/create/education/info` | Guidance before adding a qualification. |
| `education-type.html` | `/cv/create/education/type` | Qualification type and institution. |
| `education-subjects.html` | dynamic route | Repeatable subject and grade pairs. |
| `education-review.html` | `/cv/create/education/review` | Summary cards, with Change and Remove. |
| `skills.html` | `/cv/create/skills` | Repeatable skill inputs, 128 characters each. |
| `additional-info.html` | `/cv/create/additional-info` | Custom section title and details. |
| `additional-info-review.html` | dynamic route | Summary cards for custom sections, with Change and Remove. |
| `job-title.html` | — | Option 1 only. The job the feedback should be tailored to. |
| `more-about-you.html` | — | Option 1 only. Lists the sections still Not started before showing feedback. |
| `ai-feedback.html` | — | Option 1 only. Overall comment, then up to 5 pieces of feedback in an accordion. |
| `feedback-edit.html` | — | Option 1 only. One piece of feedback beside the profile, editable. `?n=` picks which. |

Flows, each ending on Done and returning to the task list with a success banner
and the row marked Completed:

- **Personal profile**: `profile-info.html` → `profile.html`
- **Work history**: `work-history.html` → `work-history-info.html` →
  `work-history-job.html` → `work-history-responsibilities.html` →
  `work-history-review.html`. The gap branch runs
  `work-history-gaps-info.html` → `work-history-gaps.html` and joins the same
  review page.
- **Education and training**: `education-info.html` → `education-type.html` →
  `education-subjects.html` → `education-review.html`
- **Skills**: `skills.html` on its own
- **Add custom section**: `additional-info.html` → `additional-info-review.html`

On `profile.html`, option 2 shows two action links - Get AI feedback, into the
same `job-title.html` as option 1, and a dead Preview section - where option 1
shows the Yes/No radios and a Preview button. The action link is a GOV.UK
Publishing Component rather than a GOV.UK Frontend one, so its styles are
reproduced in `assets/styles.css`.

Option 2 gives the personal profile a section of its own on the task list -
"3. Write Personal Profile", between the optional sections and Check and
download, which becomes 4. `applyOptionTwoLayout` in `assets/task-list.js` moves
the task; the task and its hint are otherwise unchanged.

Option 1 adds an AI feedback branch off the personal profile. Answering Yes to
"Would you like AI feedback?" goes to `job-title.html`; from there, any section
still Not started sends you to `more-about-you.html` before `ai-feedback.html`.
A section opened from that page returns to it when its Done button is pressed,
rather than dropping you back on the task list.

The feedback itself is placeholder text in `AI_FEEDBACK` in `assets/ai-flow.js`,
pending the AI plumbing - the accordion and the edit pages are built from that
list, so a real response drops straight in. `feedback-edit.html` walks the list
with Next feedback, saving the profile each time so later pages show the edits
made on earlier ones, and the accordion is set to `data-remember-expanded="false"`
so Back to all feedback always lands with everything collapsed. The Back link at
the top of an edit page returns to the previous page rather than to the list.

Jobs and gaps share one ordered list, so they interleave on the review page the
way the live service shows them.

Remaining task rows are dead links (`href="#"`), as are the header nav, footer
links, sign in, Cymraeg, and the "preview how this section looks" link. Clicking
one does nothing at all — `chrome.js` swallows the click so the page does not
jump back to the top.

## Password gate

Every page loads `assets/auth.js` in the head, which sends you to
`password.html` unless this browser session has been unlocked. The password is
`star`, and entering it takes you to the cover page. The password page shows a
GOV.UK error summary and inline error on a wrong password, and carries the plain
GOV.UK header only - no service navigation, phase banner or language toggle.

This is a front-of-house gate for sharing the prototype, **not security**. The
password is in the source in plain sight and the unlock flag is a
`sessionStorage` value, so anyone who wants past it can get past it. Real access
control for the deployed site is Vercel's Deployment Protection, which is set to
All Deployments.

To remove the gate, delete the `assets/auth.js` script tag from each page.

## AI feedback

`api/feedback.py` asks Claude for feedback on the personal profile. It is a
Vercel Python serverless function at `/api/feedback`, and `serve.py` imports the
same module locally, so there is one implementation.

**The API key stays on the server.** It is read from `ANTHROPIC_API_KEY` and is
never sent to the browser - the page posts the CV answers and gets finished
feedback back. On Vercel, set `ANTHROPIC_API_KEY` in Project Settings ->
Environment Variables; locally, put it in `.env`.

The request sends everything the person has entered - profile, the job they are
going for, work history and gaps, education, skills and any custom sections - so
the feedback can suggest things they could say about themselves rather than
inventing experience. The response is constrained by a JSON schema
(`output_config.format`), so the page never has to parse prose: it gets a
summary and up to 5 items, each with a title, the detail, and whether it is a
must change.

Feedback is cached in `sessionStorage` against the profile and job title it was
written about, so the edit pages show the same items the accordion did and a
reload does not spend another request. Change either, and the next visit asks
again.

If the API cannot be reached - no key, no SDK installed, offline - the page
falls back to the example feedback in `PLACEHOLDER_FEEDBACK` and shows a warning
saying so, so the flow can still be demonstrated.

## How it is built

Plain HTML with [GOV.UK Frontend 6.5.1](https://github.com/alphagov/govuk-frontend)
vendored in `vendor/govuk/` (CSS, JS, fonts, favicon) so it runs offline. No build
step and no dependencies.

- `assets/chrome.js` — Work Hub header, service navigation, Experimental phase
  banner and footer, injected into every page so a change lands everywhere.
- `assets/store.js` — prototype state in `localStorage`, keyed per option so the
  two prototypes hold separate answers and reset independently; also resolves
  which option is in play (`window.protoOption`) and holds the one-shot success
  banner message in `sessionStorage`.
- `assets/task-list.js` — the task list rows and their status tags. Add or reorder
  tasks in `TASK_SECTIONS`.
- `assets/flows.js` — helpers shared by the flows: summary cards, date formatting
  and the repeatable "Add another ..." inputs.
- `assets/work-history.js` and `assets/education.js` — the two flows' form
  handling and review pages.
- `assets/sections.js` — skills and the custom "Add a section" flow.
- `assets/ai-flow.js` — the option 1 AI feedback branch: which sections count as
  outstanding, where the job title page goes next, and the call to
  `/api/feedback` with its cache and fallback.
- `api/feedback.py` — the serverless function that asks Claude, and the prompt
  that tells it how to give careers-adviser feedback.
- `assets/styles.css` — the handful of Work Hub specific styles GOV.UK Frontend
  does not cover.

## Copy

All wording is lifted verbatim from the live service's translation bundle, so
headings, hints, bullet lists and the bookkeeper example match production.

## Assumptions

The task list rows render client-side behind a session, so the rendered list could
not be read from the live site. These were reconstructed from the translation keys
and may need correcting against the real thing:

1. **Which rows sit in which section.** Required: Contact details, Work history.
   Optional: Personal profile, Education and training, Skills, Add custom section.
   Check and download: Name your CV, Check what you entered, Download your CV.
2. **The 1,000 character limit** on the personal profile textarea — the real limit
   is set in a route chunk that only loads for a signed-in session.
3. **The order of the two bullet lists** on `profile-info.html` relative to their
   intro paragraphs ("To use this section effectively:" and "Make sure you:").
4. **Job and subject routes.** `/cv/create/work-history`, `/info`, `/review`,
   `/gaps`, `/gaps/info`, `/education/info`, `/education/type` and
   `/education/review` were confirmed against the live service. The job details,
   responsibilities and subjects pages sit behind dynamic per-item routes that
   could not be probed, so their filenames are my own.
5. **"Type of qualification"** is spelled with a double space in the live
   translation bundle. Treated as a typo and rendered with one.
6. **The order of the skills page content.** The copy is verbatim from the live
   translation bundle (`CvBuilderSkills`), but the bundle does not say whether
   "You can explain how you've used these skills..." sits above or below the
   bulleted list. It is rendered below.
7. **The custom section character limit.** `CvBuilderAdditionalInfoPage` has an
   "error-character-limit-exceeded" key but not the number, so the details
   textarea reuses the personal profile's 1,000.

Error states are deliberately not built — happy path only.
