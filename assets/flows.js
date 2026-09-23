/* Helpers shared by the work history and education flows. */

/* Bootstrap Icons "stars" (bootstrap-icons 1.11.3), inlined rather than loaded
   as a webfont so the prototype keeps running offline with no dependencies. */
const AI_ICON = '<svg class="workhub-ai-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
  '<path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>' +
  '</svg>';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* "Mar 2023", falling back to whatever the person actually typed. */
function monthYear(month, year) {
  const index = parseInt(month, 10) - 1;
  const name = MONTHS[index] || month || '';
  return (name + ' ' + (year || '')).trim();
}

function dateRange(item) {
  const from = monthYear(item.startMonth, item.startYear);
  if (!from) return '';
  if (item.current) return from + ' to present';
  const to = monthYear(item.endMonth, item.endYear);
  return to ? from + ' to ' + to : from;
}

function formValues(form) {
  const values = {};
  new FormData(form).forEach(function (value, key) {
    if (values[key] === undefined) {
      values[key] = typeof value === 'string' ? value.trim() : value;
    } else {
      values[key] = [].concat(values[key], String(value).trim());
    }
  });
  return values;
}

function isBlank(value) {
  return String(value == null ? '' : value).trim() === '';
}

/* A GOV.UK summary card with Change and Remove actions. Rows whose value was
   left empty are dropped, so the card only shows what was actually entered. */
function summaryCard(title, rows, index, kind) {
  const rowsHtml = rows.filter(function (row) {
    return !isBlank(row[1]);
  }).map(function (row) {
    return '<div class="govuk-summary-list__row">' +
      '<dt class="govuk-summary-list__key">' + escapeHtml(row[0]) + '</dt>' +
      '<dd class="govuk-summary-list__value">' + escapeHtml(row[1]) + '</dd>' +
    '</div>';
  }).join('');

  return '<div class="govuk-summary-card">' +
    '<div class="govuk-summary-card__title-wrapper">' +
      '<h2 class="govuk-summary-card__title">' + escapeHtml(title) + '</h2>' +
      '<ul class="govuk-summary-card__actions">' +
        '<li class="govuk-summary-card__action">' +
          '<a class="govuk-link" href="#" data-action="change" data-kind="' + kind + '" data-index="' + index + '">' +
          'Change<span class="govuk-visually-hidden"> ' + escapeHtml(title) + '</span></a>' +
        '</li>' +
        '<li class="govuk-summary-card__action">' +
          '<a class="govuk-link" href="#" data-action="remove" data-kind="' + kind + '" data-index="' + index + '">' +
          'Remove<span class="govuk-visually-hidden"> ' + escapeHtml(title) + '</span></a>' +
        '</li>' +
      '</ul>' +
    '</div>' +
    '<div class="govuk-summary-card__content">' +
      '<dl class="govuk-summary-list">' + rowsHtml + '</dl>' +
    '</div>' +
  '</div>';
}

/* Repeatable "Add another ..." inputs, numbered from 1. Focus moves to the new
   field only when someone asked for it, so fields rendered on page load do not
   scroll the page down to the last one. */
function addRepeatable(container, build, focus) {
  const index = container.children.length + 1;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = build(index);
  container.appendChild(wrapper.firstElementChild);

  if (focus) {
    const input = container.lastElementChild.querySelector('input, textarea');
    if (input) input.focus();
  }
}
