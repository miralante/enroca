/* Ludia — network-first with a cache fallback, isolated by app name and
   registration scope. The server copy wins while online; the cache answers
   only when the network is unreachable. */
'use strict';
var VERSION = 'ludia-v25';
var FILES = [
  "./",
  "./app.js",
  "./data.js",
  "./chess.js",
  "./minigames.js",
  "./strings.es.js",
  "./strings.en.js",
  "./assets/js/core.js",
  "./assets/js/locale-picker.js",
  /* External scripts that used to be inline <script> blocks. The CSP is
     `script-src self`, so they must stay external: locale-picker-config
     (the enroca:locale key, #settings link and high-contrast class) and
     sw-register (the PWA). */
  "./assets/js/locale-picker-config.js",
  "./assets/js/sw-register.js",
  "./assets/css/styles.css",
  "./assets/css/locale-picker.css",
  "./assets/fonts/atkinson-hyperlegible-400.woff2",
  "./assets/fonts/atkinson-hyperlegible-700.woff2",
  "./assets/fonts/nunito-variable.woff2",
  "./assets/fonts/Atkinson-OFL.txt",
  "./assets/fonts/Nunito-OFL.txt",
  "./assets/img/icon.svg",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./manifest.json",
  "./404.html",
  "./ludia.js",
  "./assets/css/ludia.css",
  "./assets/css/game-boards.css",
  "./games/battleship.js",
  "./games/checkers-content.js",
  "./games/checkers-view.js",
  "./games/checkers.js",
  "./games/connect-four.js",
  "./games/curriculum.js",
  "./games/domino-content.js",
  "./games/domino-view.js",
  "./games/domino.js",
  "./games/shared.js",
  "./games/sudoku-content.js",
  "./games/sudoku-view.js",
  "./games/sudoku.js",
  "./games/tetris-content.js",
  "./games/tetris-view.js",
  "./games/tetris.js",
  "./games/tic-tac-toe.js",
  "./games/ui-strings.js",
  "./games/views.js"
];
var SCOPE = encodeURIComponent(self.registration.scope);
var CACHE = VERSION + ':' + SCOPE;
/* Cloudflare answers EVERY "/x.html" URL with a 307 to its extensionless form
   (/index.html -> /, /404.html -> /404, /offline.html -> /offline). Following
   that redirect yields a response with `redirected === true`, and the Cache API
   PRESERVES that flag across a store/load round trip, so cache.addAll()
   silently poisons the entry under its original key. Chrome refuses to hand
   such a response to a top-level navigation ("Response served by service
   worker has redirections") — which is what broke Back on the site that also
   shipped sw-v10.js precaching "./index.html".

   Rebuilding the response produces a brand-new object whose flag is false while
   keeping body, status and headers. */
function deRedirect(res) {
  if (!res || !res.redirected) return res;
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  });
}

/* addAll() stores the followed response as-is, so precache entry by entry and
   sanitise. Still all-or-nothing: a missing file rejects, as addAll did. */
function precache(cache, files) {
  return Promise.all(files.map(function (file) {
    /* cache: 'reload' avoids stale copies from the browser HTTP cache */
    return fetch(new Request(file, { cache: 'reload' })).then(function (res) {
      if (!res || !res.ok) throw new Error('precache failed: ' + file);
      return cache.put(file, deRedirect(res));
    });
  }));
}

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return precache(cache, FILES);
  }).then(function () {
    /* Take over immediately. Without this the freshly installed worker
       stays in "waiting" while the previous one keeps controlling every
       open tab, so a returning visitor keeps the OLD cache (including its
       redirect-poisoned entries) until they close every tab of the site.
       Verified: production was already serving ludia-v23 while the
       browser was still running ludia-v11. Every sibling project in the
       suite calls skipWaiting() for this reason. */
    return self.skipWaiting();
  }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
      return (key.startsWith('enroca-v') || key.startsWith('ludia-v')) && key.endsWith(':' + SCOPE) && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return fetch(event.request).then(function (response) {
      if (response && response.ok) cache.put(event.request, deRedirect(response.clone()));
      return deRedirect(response);
    }).catch(function () {
      return cache.match(event.request, { ignoreSearch: true }).then(function (cached) {
        /* A hit can come from a precache written by an older worker. */
        if (cached) return deRedirect(cached);
        if (event.request.mode === 'navigate') {
          return cache.match('./').then(function (home) {
            /* Navigation fallback: never hand back a redirected response. */
            return home ? deRedirect(home) : new Response('', { status: 504, statusText: 'Offline' });
          });
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  }));
});
