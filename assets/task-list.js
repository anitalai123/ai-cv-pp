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
      href: '#',
    },
  ],
  'task-list-optional': [
    {
      id: 'profile',
      name: 'Personal profile',
      hint: 'Short summary on why you would be a good fit for the job',
      href: 'profile-info.html',
    },
    {
      id: 'education',
      name: 'Education and training',
      hint: 'Educational or professional qualifications and courses',
      href: '#',
    },
    {
      id: 'skills',
      name: 'Skills',
      hint: 'Skills relevant to the job you are applying for',
      href: '#',
    },
    {
      id: 'additionalInfo',
      name: 'Add custom section',
      hint: 'For example, achievements, awards, interests, or licences',
      href: '#',
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

function statusFor(task, state) {
  const requiredDone = TASK_SECTIONS['task-list-required'].every(function (t) {
    return Boolean(state[t.id]);
  });
  if (task.needsRequired && !requiredDone) return 'cannot-start';
  return state[task.id] ? 'completed' : 'not-started';
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
