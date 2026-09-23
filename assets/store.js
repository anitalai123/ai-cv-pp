/* Prototype state. Everything the CV holds lives in one localStorage key so the
   task list can derive its statuses and the flows can hand data to each other. */

const STORE_KEY = 'build-a-cv-prototype';

const Store = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  write(patch) {
    const next = Object.assign(this.read(), patch);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch (e) {
      /* private browsing - the prototype still works, it just will not persist */
    }
    return next;
  },

  clear() {
    try {
      localStorage.removeItem(STORE_KEY);
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
