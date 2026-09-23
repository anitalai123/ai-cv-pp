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
