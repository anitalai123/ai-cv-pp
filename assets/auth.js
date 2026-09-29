/* Prototype password gate.

   This is a front-of-house gate for sharing the prototype, NOT security. The
   password sits in this file in plain sight and the unlock flag is just a
   sessionStorage value, so anyone who wants in can get in. Real access control
   for the deployed site is Vercel's Deployment Protection. */

var PROTOTYPE_PASSWORD = 'star';
var UNLOCK_KEY = 'build-a-cv-prototype-unlocked';

function prototypeUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function unlockPrototype() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, 'true');
  } catch (e) {}
}

var RETURN_KEY = 'build-a-cv-prototype-return-to';
var PARTICIPANT_KEY = 'build-a-cv-prototype-participant';

/* Participant links for unmoderated testing carry ?participant=1. It is kept in
   sessionStorage like the option, so it lasts for the rest of the visit and
   keeps the participant out of the cover page, which shows both options. */
function isParticipant() {
  try {
    if (new URLSearchParams(window.location.search).get('participant') === '1') {
      sessionStorage.setItem(PARTICIPANT_KEY, 'true');
    }
    return sessionStorage.getItem(PARTICIPANT_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/* Where the password page sends people once unlocked: the page they were trying
   to open, so a participant link still lands on its own task list. */
function pageAfterUnlock() {
  try {
    return sessionStorage.getItem(RETURN_KEY) || 'index.html';
  } catch (e) {
    return 'index.html';
  }
}

/* Runs before the page renders, so a locked page never flashes into view. */
(function () {
  var path = window.location.pathname;
  var onPasswordPage = /(^|\/)password\.html$/.test(path);
  var onCoverPage = /(^|\/)(index\.html)?$/.test(path);

  if (onCoverPage && isParticipant()) {
    window.location.replace('task-list.html');
    return;
  }

  if (onPasswordPage || prototypeUnlocked()) return;

  try {
    sessionStorage.setItem(RETURN_KEY, window.location.href);
  } catch (e) {}
  window.location.replace('password.html');
})();
