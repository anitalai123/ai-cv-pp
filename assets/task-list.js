/* Renders the three task list sections and derives each status from the store.
   Sections that are not part of this prototype are dead links (href "#"). */

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

/* Option 2 gives the personal profile a section of its own, between the
   optional sections and Check and download, rather than sitting last among the
   optional ones. The task itself, hint included, is unchanged. */
function applyOptionTwoLayout() {
  const optional = TASK_SECTIONS['task-list-optional'];
  const at = optional.findIndex(function (task) {
    return task.id === 'profile';
  });
  if (at === -1) return;

  TASK_SECTIONS['task-list-profile'] = optional.splice(at, 1);

  document.getElementById('heading-profile').hidden = false;
  document.getElementById('task-list-profile').hidden = false;
  document.getElementById('heading-finish').textContent = '4. Check and download';
}

document.addEventListener('DOMContentLoaded', function () {
  /* Reaching the task list ends any detour from "We need more about you", so a
     section finished later on does not bounce back there. */
  Return.take();

  /* The personal profile picks up on whichever page of it was open last. */
  TASK_SECTIONS['task-list-optional'].forEach(function (task) {
    if (task.id === 'profile') task.href = ProfileResume.href();
  });

  if (window.protoOption === '2') applyOptionTwoLayout();

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
