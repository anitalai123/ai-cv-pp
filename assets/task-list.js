/* Renders the three task list sections and derives each status from the store.
   Sections that are not part of this prototype are dead links (href "#"). */

/* Bootstrap Icons "stars" (bootstrap-icons 1.11.3), inlined rather than loaded
   as a webfont so the prototype keeps running offline with no dependencies. */
const AI_ICON = '<svg class="workhub-ai-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
  '<path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>' +
  '</svg>';

const TASK_SECTIONS = {
  'task-list-required': [
    {
      id: 'contactDetails',
      name: 'Contact details',
      hint: 'For employers to contact you about your application',
      href: '#',
    },
    {
      id: 'workHistory',
      name: 'Work history',
      hint: 'Work experience, volunteering, or job gaps',
      href: 'work-history.html',
    },
  ],
  'task-list-optional': [
    {
      id: 'education',
      name: 'Education and training',
      hint: 'Educational or professional qualifications and courses',
      href: 'education-info.html',
    },
    {
      id: 'skills',
      name: 'Skills',
      hint: 'Skills relevant to the job you are applying for',
      href: 'skills.html',
    },
    {
      id: 'additionalInfo',
      name: 'Add custom section',
      hint: 'For example, achievements, awards, interests, or licences',
      href: 'additional-info.html',
    },
    {
      id: 'profile',
      name: 'Personal profile',
      hint: 'Short summary on why you would be a good fit for the job' +
        '<span class="workhub-ai-hint">' + AI_ICON + 'AI feedback available</span>',
      href: 'profile-info.html',
    },
  ],
  'task-list-finish': [
    { id: 'cvName', name: 'Name your CV', href: '#' },
    { id: 'checkAnswers', name: 'Check what you entered', href: '#', needsRequired: true },
    { id: 'download', name: 'Download your CV', href: '#', needsRequired: true },
  ],
};

/* GOV.UK Frontend 6 folded blue into the default tag and removed the --blue and
   --light-blue modifiers, so "Not started" is an unmodified tag and "In progress"
   uses turquoise, the nearest remaining colour to the old light blue. */
const STATUS_TAGS = {
  'not-started': { text: 'Not started', classes: '' },
  'in-progress': { text: 'In progress', classes: 'govuk-tag--turquoise' },
  'cannot-start': { text: 'Cannot start yet', classes: 'govuk-task-list__status--cannot-start-yet' },
  completed: { text: 'Completed', classes: '' },
};

/* A section counts as done when it holds something: a non-empty string for the
   free-text sections, or at least one entry for the list-based ones. An empty
   array is truthy in JavaScript, so it has to be checked explicitly. */
function hasContent(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean(value);
}

function statusFor(task, state) {
  const requiredDone = TASK_SECTIONS['task-list-required'].every(function (t) {
    return hasContent(state[t.id]);
  });
  if (task.needsRequired && !requiredDone) return 'cannot-start';
  return hasContent(state[task.id]) ? 'completed' : 'not-started';
}

function renderStatus(status, id) {
  const tag = STATUS_TAGS[status];
  if (status === 'completed') {
    return '<div class="govuk-task-list__status" id="' + id + '">' + tag.text + '</div>';
  }
  if (status === 'cannot-start') {
    return '<div class="govuk-task-list__status ' + tag.classes + '" id="' + id + '">' + tag.text + '</div>';
  }
  const tagClasses = ('govuk-tag ' + tag.classes).trim();
  return '<div class="govuk-task-list__status" id="' + id + '">' +
    '<strong class="' + tagClasses + '">' + tag.text + '</strong></div>';
}

function renderTask(task, state) {
  const status = statusFor(task, state);
  const hintId = task.id + '-hint';
  const statusId = task.id + '-status';
  const describedBy = (task.hint ? hintId + ' ' : '') + statusId;

  const title = status === 'cannot-start'
    ? '<div class="govuk-task-list__name-and-hint"><div>' + task.name + '</div>'
    : '<div class="govuk-task-list__name-and-hint">' +
        '<a class="govuk-link govuk-task-list__link" href="' + task.href + '" aria-describedby="' + describedBy + '">' +
        task.name + '</a>';

  const hint = task.hint
    ? '<div id="' + hintId + '" class="govuk-task-list__hint">' + task.hint + '</div>'
    : '';

  return '<li class="govuk-task-list__item govuk-task-list__item--with-link">' +
    title + hint + '</div>' + renderStatus(status, statusId) + '</li>';
}

document.addEventListener('DOMContentLoaded', function () {
  /* Reaching the task list ends any detour from "We need more about you", so a
     section finished later on does not bounce back there. */
  Return.take();

  const state = Store.read();

  Object.keys(TASK_SECTIONS).forEach(function (listId) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = TASK_SECTIONS[listId].map(function (task) {
      return renderTask(task, state);
    }).join('');
  });

  const message = Flash.take();
  if (message) {
    const banner = document.getElementById('success-banner');
    document.getElementById('success-banner-text').textContent = message;
    banner.hidden = false;
    banner.focus();
  }
});
