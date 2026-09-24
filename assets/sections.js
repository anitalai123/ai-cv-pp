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

  /* Four empty fields to start, or one per skill already entered if there are
     more than that. */
  const STARTING_FIELDS = 4;

  function skillField(index) {
    return '<div class="govuk-form-group">' +
      '<label class="govuk-label govuk-label--s" for="skill-' + index + '">Skill ' + index + '</label>' +
      '<input class="govuk-input" id="skill-' + index + '" name="skill" type="text" maxlength="128">' +
      '<p class="govuk-body govuk-!-margin-top-2 govuk-!-margin-bottom-0">' +
        '<a class="govuk-link" href="#" data-action="remove">Remove' +
        '<span class="govuk-visually-hidden"> skill ' + index + '</span></a>' +
      '</p>' +
    '</div>';
  }

  /* Rebuilt from scratch so the labels stay numbered 1, 2, 3... after one is
     removed from the middle. */
  function renderSkills(values) {
    container.innerHTML = '';
    values.forEach(function () { addRepeatable(container, skillField); });
    container.querySelectorAll('input[name="skill"]').forEach(function (input, i) {
      input.value = values[i];
    });
  }

  function currentSkills() {
    return Array.prototype.map.call(container.querySelectorAll('input[name="skill"]'), function (input) {
      return input.value;
    });
  }

  const initial = saved.slice();
  while (initial.length < STARTING_FIELDS) initial.push('');
  renderSkills(initial);

  document.getElementById('add-skill').addEventListener('click', function () {
    addRepeatable(container, skillField, true);
  });

  container.addEventListener('click', function (event) {
    const link = event.target.closest('a[data-action="remove"]');
    if (!link) return;
    event.preventDefault();

    const fields = Array.prototype.slice.call(container.children);
    const at = fields.indexOf(link.closest('.govuk-form-group'));
    const values = currentSkills();
    values.splice(at, 1);
    renderSkills(values);

    /* Focus would otherwise drop to the top of the page with the removed link. */
    const next = container.children[Math.min(at, values.length - 1)];
    const target = next ? next.querySelector('input') : document.getElementById('add-skill');
    target.focus();
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
