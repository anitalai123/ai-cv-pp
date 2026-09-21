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

/* Runs before the page renders, so a locked page never flashes into view. */
(function () {
  var onPasswordPage = /(^|\/)password\.html$/.test(window.location.pathname);
  if (onPasswordPage || prototypeUnlocked()) return;

  window.location.replace('password.html');
})();
