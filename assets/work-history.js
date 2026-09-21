/* Work history: job details, responsibilities, gaps and the review page.
   Items are kept in one ordered list so jobs and gaps interleave, which is how
   the live service shows them. */

function workHistory() {
  return Store.read().workHistory || [];
}

function saveWorkHistory(items) {
  Store.write({ workHistory: items });
}

/* ------------------------------------------------------------ job details */

const jobForm = document.getElementById('job-form');
if (jobForm) {
  const draft = Store.read().draftJob;
  if (draft) {
    jobForm.jobTitle.value = draft.jobTitle || '';
    jobForm.employer.value = draft.employer || '';
  }

  jobForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(jobForm);
    Store.write({
      draftJob: {
        type: 'job',
        jobTitle: values.jobTitle,
        employer: values.employer,
        startMonth: values.startMonth,
        startYear: values.startYear,
        current: values.current === 'yes',
        endMonth: values.endMonth,
        endYear: values.endYear,
        responsibilities: [],
      },
    });
    window.location.href = 'work-history-responsibilities.html';
  });
}

/* -------------------------------------------------------- responsibilities */

const responsibilitiesForm = document.getElementById('responsibilities-form');
if (responsibilitiesForm) {
  const draft = Store.read().draftJob || {};
  const heading = document.getElementById('responsibilities-heading');

  /* "Add your responsibilities for {title} at {company}", with the same
     fallbacks the live service uses when either is missing. */
  if (draft.jobTitle || draft.employer) {
    heading.textContent = 'Add your responsibilities for ' +
      (draft.jobTitle || 'your job') + ' at ' + (draft.employer || 'Unknown Company');
  }

  const container = document.getElementById('responsibilities');

  function responsibilityField(index) {
    return '<div class="govuk-character-count" data-module="govuk-character-count" data-maxlength="1500">' +
      '<div class="govuk-form-group">' +
        '<label class="govuk-label govuk-label--s" for="responsibility-' + index + '">Responsibility ' + index + '</label>' +
        '<textarea class="govuk-textarea govuk-js-character-count" id="responsibility-' + index + '" ' +
          'name="responsibility" rows="4" aria-describedby="responsibility-' + index + '-info"></textarea>' +
      '</div>' +
      '<div id="responsibility-' + index + '-info" class="govuk-hint govuk-character-count__message">' +
        'You have 1,500 characters remaining</div>' +
    '</div>';
  }

  function addField(focus) {
    addRepeatable(container, responsibilityField, focus);
    if (window.initCharacterCount) window.initCharacterCount(container.lastElementChild);
  }

  /* chrome.js is a module, so it runs after this script but before
     DOMContentLoaded - by which point initCharacterCount exists. */
  document.addEventListener('DOMContentLoaded', function () {
    addField();
    addField();
    addField();
  });

  document.getElementById('add-responsibility').addEventListener('click', function () {
    addField(true);
  });

  responsibilitiesForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(responsibilitiesForm);
    const responsibilities = [].concat(values.responsibility || []).filter(Boolean);

    const items = workHistory();
    const job = Object.assign({}, Store.read().draftJob, { responsibilities: responsibilities });

    /* Nothing entered anywhere - do not add an empty card. */
    if (isBlank(job.jobTitle) && isBlank(job.employer) && !dateRange(job) && !responsibilities.length) {
      Store.write({ draftJob: null });
      window.location.href = 'work-history-review.html';
      return;
    }

    if (typeof job.editIndex === 'number') {
      const at = job.editIndex;
      delete job.editIndex;
      items[at] = job;
    } else {
      items.push(job);
    }

    saveWorkHistory(items);
    Store.write({ draftJob: null });
    window.location.href = 'work-history-review.html';
  });
}

/* ------------------------------------------------------------------- gaps */

const gapForm = document.getElementById('gap-form');
if (gapForm) {
  gapForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(gapForm);

    const gap = {
      type: 'gap',
      gapTitle: values.gapTitle,
      startMonth: values.gapStartMonth,
      startYear: values.gapStartYear,
      current: values.gapCurrent === 'yes',
      endMonth: values.gapEndMonth,
      endYear: values.gapEndYear,
      summary: values.gapSummary,
    };

    if (!isBlank(gap.gapTitle) || !isBlank(gap.summary) || dateRange(gap)) {
      const items = workHistory();
      items.push(gap);
      saveWorkHistory(items);
    }

    window.location.href = 'work-history-review.html';
  });
}

/* ----------------------------------------------------------------- review */

const workHistorySummary = document.getElementById('work-history-summary');
if (workHistorySummary) {
  function render() {
    const items = workHistory();

    if (!items.length) {
      workHistorySummary.innerHTML =
        '<p class="govuk-body">You have not added any work history yet.</p>';
      return;
    }

    workHistorySummary.innerHTML = items.map(function (item, index) {
      if (item.type === 'gap') {
        const rows = [['Dates', dateRange(item)]];
        if (item.summary) rows.push(['Details', item.summary]);
        return summaryCard(item.gapTitle || 'Your break', rows, index, 'gap');
      }

      const details = [item.jobTitle, item.employer].filter(function (part) {
        return !isBlank(part);
      }).join(', ');

      const rows = [
        ['Job Details', details],
        ['Dates', dateRange(item)],
      ];
      (item.responsibilities || []).forEach(function (text, i) {
        rows.push(['Responsibility ' + (i + 1), text]);
      });
      return summaryCard(item.jobTitle || 'Your job', rows, index, 'job');
    }).join('');
  }

  render();

  workHistorySummary.addEventListener('click', function (event) {
    const link = event.target.closest('a[data-action]');
    if (!link) return;
    event.preventDefault();

    const index = Number(link.dataset.index);
    const items = workHistory();

    if (link.dataset.action === 'remove') {
      items.splice(index, 1);
      saveWorkHistory(items);
      render();
      return;
    }

    /* Change: reopen the item in its own flow. */
    if (link.dataset.kind === 'gap') {
      window.location.href = 'work-history-gaps.html';
    } else {
      Store.write({ draftJob: Object.assign({}, items[index], { editIndex: index }) });
      window.location.href = 'work-history-job.html';
    }
  });

  document.getElementById('work-history-done').addEventListener('click', function () {
    Flash.set('Work history updated');
    window.location.href = 'task-list.html';
  });
}
