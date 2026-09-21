# Build a CV — prototype

A static rebuild of the GOV.UK Work Hub "Build a CV" task list and Personal profile
flow, as a baseline for designing AI feedback on the Personal profile.

## Running it

```
python3 -m http.server 8123
```

Then open http://localhost:8123. Opening the HTML files directly in a browser also
works — nothing depends on a server.

## Pages

| File | Mirrors | Notes |
| --- | --- | --- |
| `index.html` | `/cv` | Start page. Also has a "reset all saved answers" link. |
| `task-list.html` | `/cv/create/task-list` | Three sections, statuses derived from saved answers. |
| `profile-info.html` | `/cv/create/profile/info` | Guidance page, including the "If you are using AI to help you" details. |
| `profile.html` | `/cv/create/profile` | Character-counted textarea. **This is where AI feedback goes** — see the `<!-- AI feedback will go here -->` marker. |

Personal profile flow: task list → `profile-info.html` → `profile.html` → Done →
back to the task list with a "Personal Profile updated" success banner and the row
marked Completed.

Every other task row is a dead link (`href="#"`), as are the header nav, footer
links, sign in, Cymraeg, and the "preview how this section looks" link.

## How it is built

Plain HTML with [GOV.UK Frontend 6.5.1](https://github.com/alphagov/govuk-frontend)
vendored in `vendor/govuk/` (CSS, JS, fonts, favicon) so it runs offline. No build
step and no dependencies.

- `assets/chrome.js` — Work Hub header, service navigation, Experimental phase
  banner and footer, injected into every page so a change lands everywhere.
- `assets/store.js` — prototype state in `localStorage`, plus the one-shot success
  banner message in `sessionStorage`.
- `assets/task-list.js` — the task list rows and their status tags. Add or reorder
  tasks in `TASK_SECTIONS`.
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

Error states are deliberately not built — happy path only.
