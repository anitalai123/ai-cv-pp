/* Education and training: qualification details, subjects and the review page. */

function education() {
  return Store.read().education || [];
}

function saveEducation(items) {
  Store.write({ education: items });
}

/* ------------------------------------------------- qualification details */

const educationForm = document.getElementById('education-form');
if (educationForm) {
  const draft = Store.read().draftEducation;
  if (draft) {
    educationForm.courseType.value = draft.courseType || '';
    educationForm.institution.value = draft.institution || '';
  }

  educationForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(educationForm);
    Store.write({
      draftEducation: Object.assign({}, draft, {
        courseType: values.courseType,
        institution: values.institution,
        subjects: [],
      }),
    });
    window.location.href = 'education-subjects.html';
  });
}

/* ------------------------------------------------------------- subjects */

const subjectsForm = document.getElementById('subjects-form');
if (subjectsForm) {
  const draft = Store.read().draftEducation || {};
  const heading = document.getElementById('subjects-heading');

  /* "Add {courseType} subjects for {institution}", with the live service's
     fallback when the qualification type is missing. */
  heading.textContent = 'Add ' + (draft.courseType || 'this qualification') +
    ' subjects for ' + (draft.institution || 'your school or institution');

  const container = document.getElementById('subjects');

  function subjectFields(index) {
    return '<div class="govuk-form-group">' +
      '<label class="govuk-label govuk-label--s" for="subject-' + index + '">Subject ' + index + '</label>' +
      '<div id="subject-' + index + '-hint" class="govuk-hint">' +
        "For example, 'English' or 'Business Studies'</div>" +
      '<input class="govuk-input" id="subject-' + index + '" name="subject" type="text" ' +
        'aria-describedby="subject-' + index + '-hint">' +
      '<label class="govuk-label govuk-label--s govuk-!-margin-top-4" for="grade-' + index + '">' +
        'Grade for Subject ' + index + '</label>' +
      '<div id="grade-' + index + '-hint" class="govuk-hint">' +
        "For example, 'C', '8' or '2:2'</div>" +
      '<input class="govuk-input govuk-input--width-5" id="grade-' + index + '" name="grade" type="text" ' +
        'aria-describedby="grade-' + index + '-hint">' +
    '</div>';
  }

  addRepeatable(container, subjectFields);

  document.getElementById('add-subject').addEventListener('click', function () {
    addRepeatable(container, subjectFields);
  });

  subjectsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(subjectsForm);
    const subjectNames = [].concat(values.subject || []);
    const grades = [].concat(values.grade || []);

    const subjects = subjectNames.map(function (name, i) {
      return { subject: name, grade: grades[i] || '' };
    }).filter(function (s) {
      return s.subject;
    });

    const items = education();
    const entry = Object.assign({}, Store.read().draftEducation, { subjects: subjects });

    if (typeof entry.editIndex === 'number') {
      const at = entry.editIndex;
      delete entry.editIndex;
      items[at] = entry;
    } else {
      items.push(entry);
    }

    saveEducation(items);
    Store.write({ draftEducation: null });
    window.location.href = 'education-review.html';
  });
}

/* --------------------------------------------------------------- review */

const educationSummary = document.getElementById('education-summary');
if (educationSummary) {
  function renderEducation() {
    const items = education();

    if (!items.length) {
      educationSummary.innerHTML =
        '<p class="govuk-body">You have not added any education or training yet.</p>';
      return;
    }

    educationSummary.innerHTML = items.map(function (item, index) {
      const rows = [['School or institute', item.institution || '']];
      (item.subjects || []).forEach(function (s) {
        rows.push(['Subject and grade', s.subject + (s.grade ? ' - ' + s.grade : '')]);
      });
      return summaryCard(item.courseType || 'this qualification', rows, index, 'education');
    }).join('');
  }

  renderEducation();

  educationSummary.addEventListener('click', function (event) {
    const link = event.target.closest('a[data-action]');
    if (!link) return;
    event.preventDefault();

    const index = Number(link.dataset.index);
    const items = education();

    if (link.dataset.action === 'remove') {
      items.splice(index, 1);
      saveEducation(items);
      renderEducation();
      return;
    }

    Store.write({ draftEducation: Object.assign({}, items[index], { editIndex: index }) });
    window.location.href = 'education-type.html';
  });

  document.getElementById('education-done').addEventListener('click', function () {
    Flash.set('Education and training updated');
    window.location.href = 'task-list.html';
  });
}
