/* Shared Work Hub page chrome (header + footer), mirrored from the live service.
   Kept in one file so design tweaks apply to every page at once.

   Loaded as a module so it can import GOV.UK Frontend directly - the dist bundle
   is an ES module and does not expose a window.GOVUKFrontend global. */

import { initAll, createAll, CharacterCount, Accordion } from '../vendor/govuk/govuk-frontend.min.js';

/* Flow scripts are classic scripts and cannot import, so expose a targeted
   initialiser for the character counts they add after the page has loaded. */
window.initCharacterCount = function (scope) {
  createAll(CharacterCount, undefined, { scope: scope });
};

/* The AI feedback accordion is built from the API response, so it does not
   exist when initAll runs. */
window.initAccordion = function (element) {
  new Accordion(element);
};

const GOVUK_LOGO = `<svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 60" height="30" width="162" fill="currentcolor" class="govuk-header__logotype" aria-label="GOV.UK"><title>GOV.UK</title><g><circle cx="20" cy="17.6" r="3.7"></circle><circle cx="10.2" cy="23.5" r="3.7"></circle><circle cx="3.7" cy="33.2" r="3.7"></circle><circle cx="31.7" cy="30.6" r="3.7"></circle><circle cx="43.3" cy="17.6" r="3.7"></circle><circle cx="53.2" cy="23.5" r="3.7"></circle><circle cx="59.7" cy="33.2" r="3.7"></circle><circle cx="31.7" cy="30.6" r="3.7"></circle><path d="M33.1,9.8c.2-.1.3-.3.5-.5l4.6,2.4v-6.8l-4.6,1.5c-.1-.2-.3-.3-.5-.5l1.9-5.9h-6.7l1.9,5.9c-.2.1-.3.3-.5.5l-4.6-1.5v6.8l4.6-2.4c.1.2.3.3.5.5l-2.6,8c-.9,2.8,1.2,5.7,4.1,5.7h0c3,0,5.1-2.9,4.1-5.7l-2.6-8ZM37,37.9s-3.4,3.8-4.1,6.1c2.2,0,4.2-.5,6.4-2.8l-.7,8.5c-2-2.8-4.4-4.1-5.7-3.8.1,3.1.5,6.7,5.8,7.2,3.7.3,6.7-1.5,7-3.8.4-2.6-2-4.3-3.7-1.6-1.4-4.5,2.4-6.1,4.9-3.2-1.9-4.5-1.8-7.7,2.4-10.9,3,4,2.6,7.3-1.2,11.1,2.4-1.3,6.2,0,4,4.6-1.2-2.8-3.7-2.2-4.2.2-.3,1.7.7,3.7,3,4.2,1.9.3,4.7-.9,7-5.9-1.3,0-2.4.7-3.9,1.7l2.4-8c.6,2.3,1.4,3.7,2.2,4.5.6-1.6.5-2.8,0-5.3l5,1.8c-2.6,3.6-5.2,8.7-7.3,17.5-7.4-1.1-15.7-1.7-24.5-1.7h0c-8.8,0-17.1.6-24.5,1.7-2.1-8.9-4.7-13.9-7.3-17.5l5-1.8c-.5,2.5-.6,3.7,0,5.3.8-.8,1.6-2.3,2.2-4.5l2.4,8c-1.5-1-2.6-1.7-3.9-1.7,2.3,5,5.2,6.2,7,5.9,2.3-.4,3.3-2.4,3-4.2-.5-2.4-3-3.1-4.2-.2-2.2-4.6,1.6-6,4-4.6-3.7-3.7-4.2-7.1-1.2-11.1,4.2,3.2,4.3,6.4,2.4,10.9,2.5-2.8,6.3-1.3,4.9,3.2-1.8-2.7-4.1-1-3.7,1.6.3,2.3,3.3,4.1,7,3.8,5.4-.5,5.7-4.2,5.8-7.2-1.3-.2-3.7,1-5.7,3.8l-.7-8.5c2.2,2.3,4.2,2.7,6.4,2.8-.7-2.3-4.1-6.1-4.1-6.1h10.6,0Z"></path></g><circle class="govuk-logo-dot" cx="227" cy="36" r="7.3"></circle><path d="M94.7,36.1c0,1.9.2,3.6.7,5.4.5,1.7,1.2,3.2,2.1,4.5.9,1.3,2.2,2.4,3.6,3.2,1.5.8,3.2,1.2,5.3,1.2s3.6-.3,4.9-.9c1.3-.6,2.3-1.4,3.1-2.3.8-.9,1.3-2,1.6-3,.3-1.1.5-2.1.5-3v-.4h-11v-6.6h19.5v24h-7.7v-5.4c-.5.8-1.2,1.6-2,2.3-.8.7-1.7,1.3-2.7,1.8-1,.5-2.1.9-3.3,1.2-1.2.3-2.5.4-3.8.4-3.2,0-6-.6-8.4-1.7-2.5-1.1-4.5-2.7-6.2-4.7-1.7-2-3-4.4-3.8-7.1-.9-2.7-1.3-5.6-1.3-8.7s.5-6,1.5-8.7,2.4-5.1,4.2-7.1c1.8-2,4-3.6,6.5-4.7s5.4-1.7,8.6-1.7,4,.2,5.9.7c1.8.5,3.5,1.1,5.1,2,1.5.9,2.9,1.9,4,3.2,1.2,1.2,2.1,2.6,2.8,4.1l-7.7,4.3c-.5-.9-1-1.8-1.6-2.6-.6-.8-1.3-1.5-2.2-2.1-.8-.6-1.7-1-2.8-1.4-1-.3-2.2-.5-3.5-.5-2,0-3.8.4-5.3,1.2s-2.7,1.9-3.6,3.2c-.9,1.3-1.7,2.8-2.1,4.6s-.7,3.5-.7,5.3v.3h0ZM152.9,13.7c3.2,0,6.1.6,8.7,1.7,2.6,1.2,4.7,2.7,6.5,4.7,1.8,2,3.1,4.4,4.1,7.1s1.4,5.6,1.4,8.7-.5,6-1.4,8.7c-.9,2.7-2.3,5.1-4.1,7.1s-4,3.6-6.5,4.7c-2.6,1.1-5.5,1.7-8.7,1.7s-6.1-.6-8.7-1.7c-2.6-1.1-4.7-2.7-6.5-4.7-1.8-2-3.1-4.4-4.1-7.1-.9-2.7-1.4-5.6-1.4-8.7s.5-6,1.4-8.7,2.3-5.1,4.1-7.1c1.8-2,4-3.6,6.5-4.7s5.4-1.7,8.7-1.7h0ZM152.9,50.4c1.9,0,3.6-.4,5-1.1,1.4-.7,2.7-1.7,3.6-3,1-1.3,1.7-2.8,2.2-4.5.5-1.7.8-3.6.8-5.7v-.2c0-2-.3-3.9-.8-5.7-.5-1.7-1.3-3.3-2.2-4.5-1-1.3-2.2-2.3-3.6-3-1.4-.7-3.1-1.1-5-1.1s-3.6.4-5,1.1c-1.5.7-2.7,1.7-3.6,3s-1.7,2.8-2.2,4.5c-.5,1.7-.8,3.6-.8,5.7v.2c0,2.1.3,4,.8,5.7.5,1.7,1.2,3.2,2.2,4.5,1,1.3,2.2,2.3,3.6,3,1.5.7,3.1,1.1,5,1.1ZM189.1,58l-12.3-44h9.8l8.4,32.9h.3l8.2-32.9h9.7l-12.3,44M262.9,50.4c1.3,0,2.5-.2,3.6-.6,1.1-.4,2-.9,2.8-1.7.8-.8,1.4-1.7,1.9-2.9.5-1.2.7-2.5.7-4.1V14h8.6v28.5c0,2.4-.4,4.6-1.3,6.6-.9,2-2.1,3.6-3.7,5-1.6,1.4-3.4,2.4-5.6,3.2-2.2.7-4.5,1.1-7.1,1.1s-4.9-.4-7.1-1.1c-2.2-.7-4-1.8-5.6-3.2s-2.8-3-3.7-5c-.9-2-1.3-4.1-1.3-6.6V14h8.7v27.2c0,1.6.2,2.9.7,4.1.5,1.2,1.1,2.1,1.9,2.9.8.8,1.7,1.3,2.8,1.7s2.3.6,3.6.6h0ZM288.5,14h8.7v19.1l15.5-19.1h10.8l-15.1,17.6,16.1,26.4h-10.2l-11.5-19.7-5.6,6.3v13.5h-8.7"></path></svg>`;

/* Going back should land at the top of the destination page, the way following
   a link does. Browsers otherwise restore the scroll position the page had when
   it was left, which drops you into the middle of it. pageshow rather than load,
   so a page restored from the back/forward cache is covered too. */
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', function () {
  window.scrollTo(0, 0);
});

/* Which design option the prototype is presenting. Both options currently share
   the same pages, so the option arrives as ?option= on the way in from the cover
   page and is kept in sessionStorage - that way every page of the flow labels
   itself correctly without every internal link having to carry the parameter.
   Exposed as window.protoOption so the classic flow scripts can branch on it. */
const OPTION_KEY = 'build-a-cv-option';

function currentOption() {
  let value = null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('option');
    if (fromUrl) {
      sessionStorage.setItem(OPTION_KEY, fromUrl);
      value = fromUrl;
    } else {
      value = sessionStorage.getItem(OPTION_KEY);
    }
  } catch (e) {
    /* private browsing - fall back to option 1 */
  }
  return value === '2' ? '2' : '1';
}

window.protoOption = currentOption();

const NAV_ITEMS = [
  { href: '#', label: 'AI work assistant' },
  { href: '#', label: 'Find a job' },
  { href: 'task-list.html', label: 'Build a CV', active: true },
  { href: '#', label: 'Action plan' },
  { href: '#', label: 'For employers' },
];

/* The GOV.UK header on its own, with no service navigation, phase banner or
   language toggle. Used by the password gate, which sits outside the service. */
function renderMinimalHeader() {
  return '' +
    '<a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>' +
    '<div class="govuk-header">' +
      '<div class="govuk-header__container govuk-width-container">' +
        '<div class="govuk-header__logo">' +
          '<a href="https://www.gov.uk/" class="govuk-header__homepage-link">' + GOVUK_LOGO + '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderHeader() {
  const navHtml = NAV_ITEMS.map(function (item) {
    const activeItem = item.active ? ' govuk-service-navigation__item--active' : '';
    const activeLink = item.active
      ? '<strong class="govuk-service-navigation__active-fallback">' + item.label + '</strong>'
      : item.label;
    return '<li class="govuk-service-navigation__item' + activeItem + '">' +
      '<a class="govuk-service-navigation__link" href="' + item.href + '"' +
      (item.active ? ' aria-current="true"' : '') + '>' + activeLink + '</a></li>';
  }).join('');

  return '' +
    '<a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>' +
    '<div class="govuk-header">' +
      '<div class="govuk-header__container govuk-width-container">' +
        '<div class="govuk-header__logo">' +
          '<a href="https://www.gov.uk/" class="govuk-header__homepage-link">' + GOVUK_LOGO + '</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<section aria-label="Service information" class="govuk-service-navigation" data-module="govuk-service-navigation">' +
      '<div class="govuk-width-container">' +
        '<div class="govuk-service-navigation__container">' +
          '<span class="govuk-service-navigation__service-name">' +
            '<a class="govuk-service-navigation__link" href="#">Work Hub</a>' +
          '</span>' +
          '<nav aria-label="Menu" class="govuk-service-navigation__wrapper">' +
            '<button type="button" class="govuk-service-navigation__toggle govuk-js-service-navigation-toggle" ' +
              'aria-controls="navigation" hidden aria-hidden="true">Menu</button>' +
            '<ul class="govuk-service-navigation__list" id="navigation">' + navHtml + '</ul>' +
          '</nav>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div class="govuk-width-container">' +
      '<div class="govuk-phase-banner">' +
        '<p class="govuk-phase-banner__content">' +
          '<a class="workhub-banner-home" href="index.html">' +
            '<strong class="govuk-tag govuk-phase-banner__content__tag govuk-tag--red">Prototype' +
              '<span class="govuk-visually-hidden"> - go to prototype home</span></strong></a>' +
          '<span class="govuk-phase-banner__text">This is a prototype - option ' + window.protoOption + '</span>' +
        '</p>' +
      '</div>' +
      '<div class="workhub-language">English | <a class="govuk-link" href="#">Cymraeg</a></div>' +
    '</div>';
}

const FOOTER_CROWN = `<svg focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 60" height="30" width="32" fill="currentcolor" class="govuk-footer__crown"><g><circle cx="20" cy="17.6" r="3.7"/><circle cx="10.2" cy="23.5" r="3.7"/><circle cx="3.7" cy="33.2" r="3.7"/><circle cx="31.7" cy="30.6" r="3.7"/><circle cx="43.3" cy="17.6" r="3.7"/><circle cx="53.2" cy="23.5" r="3.7"/><circle cx="59.7" cy="33.2" r="3.7"/><circle cx="31.7" cy="30.6" r="3.7"/><path d="M33.1,9.8c.2-.1.3-.3.5-.5l4.6,2.4v-6.8l-4.6,1.5c-.1-.2-.3-.3-.5-.5l1.9-5.9h-6.7l1.9,5.9c-.2.1-.3.3-.5.5l-4.6-1.5v6.8l4.6-2.4c.1.2.3.3.5.5l-2.6,8c-.9,2.8,1.2,5.7,4.1,5.7h0c3,0,5.1-2.9,4.1-5.7l-2.6-8ZM37,37.9s-3.4,3.8-4.1,6.1c2.2,0,4.2-.5,6.4-2.8l-.7,8.5c-2-2.8-4.4-4.1-5.7-3.8.1,3.1.5,6.7,5.8,7.2,3.7.3,6.7-1.5,7-3.8.4-2.6-2-4.3-3.7-1.6-1.4-4.5,2.4-6.1,4.9-3.2-1.9-4.5-1.8-7.7,2.4-10.9,3,4,2.6,7.3-1.2,11.1,2.4-1.3,6.2,0,4,4.6-1.2-2.8-3.7-2.2-4.2.2-.3,1.7.7,3.7,3,4.2,1.9.3,4.7-.9,7-5.9-1.3,0-2.4.7-3.9,1.7l2.4-8c.6,2.3,1.4,3.7,2.2,4.5.6-1.6.5-2.8,0-5.3l5,1.8c-2.6,3.6-5.2,8.7-7.3,17.5-7.4-1.1-15.7-1.7-24.5-1.7h0c-8.8,0-17.1.6-24.5,1.7-2.1-8.9-4.7-13.9-7.3-17.5l5-1.8c-.5,2.5-.6,3.7,0,5.3.8-.8,1.6-2.3,2.2-4.5l2.4,8c-1.5-1-2.6-1.7-3.9-1.7,2.3,5,5.2,6.2,7,5.9,2.3-.4,3.3-2.4,3-4.2-.5-2.4-3-3.1-4.2-.2-2.2-4.6,1.6-6,4-4.6-3.7-3.7-4.2-7.1-1.2-11.1,4.2,3.2,4.3,6.4,2.4,10.9,2.5-2.8,6.3-1.3,4.9,3.2-1.8-2.7-4.1-1-3.7,1.6.3,2.3,3.3,4.1,7,3.8,5.4-.5,5.7-4.2,5.8-7.2-1.3-.2-3.7,1-5.7,3.8l-.7-8.5c2.2,2.3,4.2,2.7,6.4,2.8-.7-2.3-4.1-6.1-4.1-6.1h10.6,0Z"/></g></svg>`;

const FOOTER_LICENCE_LOGO = `<svg aria-hidden="true" focusable="false" class="govuk-footer__licence-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 483.2 195.7" height="17" width="41"><path fill="currentColor" d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"/></svg>`;

function renderFooter() {
  const links = [
    ['Accessibility', '#'], ['Contact', '#'], ['Cookies', '#'],
    ['Privacy', '#'], ['Terms of use', '#'],
  ].map(function (l) {
    return '<li class="govuk-footer__inline-list-item"><a class="govuk-footer__link" href="' + l[1] + '">' + l[0] + '</a></li>';
  }).join('');

  return '<div class="govuk-width-container">' +
    FOOTER_CROWN +
    '<div class="govuk-footer__meta">' +
      '<div class="govuk-footer__meta-item govuk-footer__meta-item--grow">' +
        '<ul class="govuk-footer__inline-list">' + links + '</ul>' +
        FOOTER_LICENCE_LOGO +
        '<span class="govuk-footer__licence-description">All content is available under the ' +
          '<a class="govuk-footer__link" rel="license" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">Open Government Licence v3.0</a>, except where otherwise stated</span>' +
      '</div>' +
      '<div class="govuk-footer__meta-item">' +
        '<a class="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">© Crown copyright</a>' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* Dead links in the prototype are href="#", which would otherwise jump the page
   back to the top. Swallow the click and leave the page where it is. */
document.addEventListener('click', function (event) {
  const link = event.target.closest('a[href="#"]');
  if (link) event.preventDefault();
});

const header = document.querySelector('header[data-workhub-header]');
if (header) {
  header.innerHTML = header.dataset.workhubHeader === 'minimal'
    ? renderMinimalHeader()
    : renderHeader();
}

const footer = document.querySelector('footer[data-workhub-footer]');
if (footer) footer.innerHTML = renderFooter();

initAll();
