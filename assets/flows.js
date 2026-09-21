/* Helpers shared by the work history and education flows. */

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

/* A GOV.UK summary card with Change and Remove actions. */
function summaryCard(title, rows, index, kind) {
  const rowsHtml = rows.map(function (row) {
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

/* Repeatable "Add another ..." inputs, numbered from 1. */
function addRepeatable(container, build) {
  const index = container.children.length + 1;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = build(index);
  container.appendChild(wrapper.firstElementChild);
  const input = container.lastElementChild.querySelector('input, textarea');
  if (input) input.focus();
}
