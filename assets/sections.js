/* Contact details, skills and the custom "Add a section" flow. All short
   enough to share a file: contact details is a name page and a contact methods
   page, skills is one repeatable page, custom sections are an add page and a
   review page. */

/* Where a section's Done or Continue button goes. "We need more about you"
   parks a destination so the sections it links to come back to it. */
function finishSection(banner) {
  const returnTo = Return.take();
  if (returnTo) {
    window.location.href = returnTo;
    return;
  }
  Flash.set(banner);
  window.location.href = 'task-list.html';
}

/* ------------------------------------------------------ contact details */

function contactDetails() {
  return Store.read().contactDetails || {};
}

const contactNameForm = document.getElementById('contact-name-form');
if (contactNameForm) {
  document.getElementById('full-name').value = contactDetails().name || '';

  contactNameForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = formValues(contactNameForm).name;
    Store.write({ contactDetails: Object.assign(contactDetails(), { name: name }) });
    window.location.href = 'contact-details.html';
  });
}

const contactMethodsForm = document.getElementById('contact-methods-form');
if (contactMethodsForm) {
  /* Tick the boxes for whatever was saved before GOV.UK Frontend initialises,
     so it reveals those fields on load and leaves the rest collapsed. */
  const saved = contactDetails();
  ['email', 'phone'].forEach(function (method) {
    if (isBlank(saved[method])) return;
    document.getElementById('contact-' + method).checked = true;
    contactMethodsForm[method].value = saved[method];
  });

  contactMethodsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(contactMethodsForm);
    const methods = [].concat(values.methods || []);
    /* An unticked method is dropped even if its field still holds text. */
    Store.write({
      contactDetails: Object.assign(contactDetails(), {
        email: methods.indexOf('email') !== -1 ? values.email : '',
        phone: methods.indexOf('phone') !== -1 ? values.phone : '',
      }),
    });
    finishSection('Contact details updated');
  });
}

/* --------------------------------------------------------------- skills */

const skillsForm = document.getElementById('skills-form');
if (skillsForm) {
  const container = document.getElementById('skills');
  const saved = Store.read().skills || [];

  function skillField(index) {
    return '<div class="govuk-form-group">' +
      '<label class="govuk-label govuk-label--s" for="skill-' + index + '">Skill ' + index + '</label>' +
      '<input class="govuk-input" id="skill-' + index + '" name="skill" type="text" maxlength="128">' +
    '</div>';
  }

  /* One empty field to start, or one per skill already entered. */
  const count = Math.max(saved.length, 1);
  for (let i = 0; i < count; i++) addRepeatable(container, skillField);
  container.querySelectorAll('input[name="skill"]').forEach(function (input, i) {
    input.value = saved[i] || '';
  });

  document.getElementById('add-skill').addEventListener('click', function () {
    addRepeatable(container, skillField, true);
  });

  skillsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const skills = [].concat(formValues(skillsForm).skill || [])
      .filter(function (skill) { return !isBlank(skill); });
    Store.write({ skills: skills });
    finishSection('Skills updated');
  });
}

/* ------------------------------------------------------ custom sections */

function additionalInfo() {
  return Store.read().additionalInfo || [];
}

const additionalInfoForm = document.getElementById('additional-info-form');
if (additionalInfoForm) {
  /* Change on the review page reopens the section in this form. */
  const draft = Store.read().draftSection;
  if (draft) {
    additionalInfoForm.title.value = draft.title || '';
    additionalInfoForm.details.value = draft.details || '';
  }

  additionalInfoForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const values = formValues(additionalInfoForm);
    const items = additionalInfo();
    const entry = { title: values.title, details: values.details };

    if (draft && draft.editIndex !== undefined) {
      items[draft.editIndex] = entry;
    } else if (!isBlank(values.title) || !isBlank(values.details)) {
      items.push(entry);
    }

    Store.write({ additionalInfo: items, draftSection: null });
    window.location.href = 'additional-info-review.html';
  });
}

const additionalInfoSummary = document.getElementById('additional-info-summary');
if (additionalInfoSummary) {
  /* Arriving at the review ends any edit, so "Add another section" opens an
     empty form rather than reopening the section that was last changed. */
  Store.write({ draftSection: null });

  function renderAdditionalInfo() {
    const items = additionalInfo();
    additionalInfoSummary.innerHTML = items.map(function (item, index) {
      return summaryCard(item.title || 'Section ' + (index + 1),
        [['Details', item.details]], index, 'section');
    }).join('');
  }

  renderAdditionalInfo();

  additionalInfoSummary.addEventListener('click', function (event) {
    const link = event.target.closest('a[data-action]');
    if (!link) return;
    event.preventDefault();

    const index = parseInt(link.dataset.index, 10);
    const items = additionalInfo();

    if (link.dataset.action === 'remove') {
      items.splice(index, 1);
      Store.write({ additionalInfo: items });
      renderAdditionalInfo();
      return;
    }

    Store.write({ draftSection: Object.assign({}, items[index], { editIndex: index }) });
    window.location.href = 'additional-info.html';
  });

  document.getElementById('additional-info-done').addEventListener('click', function () {
    finishSection('Additional information updated');
  });
}
