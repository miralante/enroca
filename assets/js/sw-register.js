/* ==========================================================================
   Ludia — Service worker registration.
   External so it can run at all: the CSP in `_headers` is
   `script-src 'self'` with no `unsafe-inline`, so the inline registration
   the landing page carried was silently blocked and the PWA never
   installed. Uses an absolute path so the same file works at any depth.
   ========================================================================== */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  /* Reload once when a NEW worker takes control. Only when a worker already
     controlled this page: the very first install claims the page without a
     reload. */
  var hadController = !!navigator.serviceWorker.controller;
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });

  window.addEventListener('load', function () {
    /* updateViaCache: 'none' keeps the sw.js update check off the HTTP cache. */
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(function (registration) {
        /* Ask for a new sw.js whenever the tab comes back into view. */
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') registration.update().catch(function () {});
        });
      })
      .catch(function (err) {
        console.warn('[ludia] service worker registration failed:', err);
      });
  });
})();
