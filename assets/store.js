/* Prototype state. Everything the CV holds lives in one localStorage key so the
   task list can derive its statuses and the flows can hand data to each other.

   The key is per option, so the two prototypes hold separate answers and can be
   reset independently. */

const OPTION_KEY = 'build-a-cv-option';

/* Which design option is being presented. It arrives as ?option= on the way in
   from the cover page and is kept in sessionStorage, so every page of the flow
   knows without each internal link having to carry the parameter. Resolved here
   rather than in chrome.js because the store needs it first, and this file is a
   classic script - it runs before that module does. */
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

function storeKey(option) {
  return 'build-a-cv-prototype-' + (option || window.protoOption);
}

const Store = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(storeKey())) || {};
    } catch (e) {
      return {};
    }
  },

  write(patch) {
    const next = Object.assign(this.read(), patch);
    try {
      localStorage.setItem(storeKey(), JSON.stringify(next));
    } catch (e) {
      /* private browsing - the prototype still works, it just will not persist */
    }
    return next;
  },

  /* Defaults to the option in play; the cover page passes one explicitly so a
     button there clears its own option and leaves the other alone. */
  clear(option) {
    try {
      localStorage.removeItem(storeKey(option));
    } catch (e) {}
  },
};

/* Where a section flow should return to when its Done button is pressed. Set by
   the "We need more about you" page so the sections it links to come back to it
   instead of the task list, and cleared as soon as it is used. */
const Return = {
  KEY: 'build-a-cv-return-to',
  set(href) {
    try {
      sessionStorage.setItem(this.KEY, href);
    } catch (e) {}
  },
  take() {
    try {
      const value = sessionStorage.getItem(this.KEY);
      sessionStorage.removeItem(this.KEY);
      return value;
    } catch (e) {
      return null;
    }
  },
};

/* The success banner shown at the top of the task list after finishing a section.
   Stored separately so it is shown once and then forgotten. */
const Flash = {
  KEY: 'build-a-cv-flash',
  set(text) {
    try {
      sessionStorage.setItem(this.KEY, text);
    } catch (e) {}
  },
  take() {
    try {
      const value = sessionStorage.getItem(this.KEY);
      sessionStorage.removeItem(this.KEY);
      return value;
    } catch (e) {
      return null;
    }
  },
};
