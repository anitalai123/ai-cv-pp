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

/* Placeholder feedback, pending the AI plumbing. Five is the most the page
   shows; the accordion and the edit pages are driven entirely by this list, so
   swapping in a real response means replacing these objects. */
const AI_FEEDBACK_SUMMARY = 'Your profile gives a clear sense of your experience, ' +
  'but it is doing less than it could to connect that experience to the job you are ' +
  'going for. The points below would make it stronger.';

const AI_FEEDBACK = [
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

/* 1-based, from ?n= on the edit page, clamped to the feedback that exists. */
function feedbackIndex() {
  let n = 1;
  try {
    n = parseInt(new URLSearchParams(window.location.search).get('n'), 10) || 1;
  } catch (e) {}
  return Math.min(Math.max(n, 1), AI_FEEDBACK.length);
}
