/* One-time recovery page for browsers holding an obsolete Ludia service worker. */
'use strict';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(function (registrations) {
      return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
    })
    .then(function () {
      window.location.replace('/?lang=es&v=20260914-6#home');
    });
} else {
  window.location.replace('/?lang=es&v=20260914-6#home');
}
