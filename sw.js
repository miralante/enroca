/* Ludia — cache-first, isolated by app name and registration scope. */
'use strict';
var VERSION = 'ludia-v10';
var ARCHIVOS = [
  "./",
  "./index.html",
  "./app.js",
  "./data.js",
  "./chess.js",
  "./minigames.js",
  "./strings.es.js",
  "./strings.en.js",
  "./assets/js/core.js",
  "./assets/css/styles.css",
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
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(ARCHIVOS.map(function (file) { return new Request(file, { cache: 'reload' }); }));
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
      if (response && response.ok) cache.put(event.request, response.clone());
      return response;
    }).catch(function () {
      return cache.match(event.request, { ignoreSearch: true }).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') return cache.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  }));
});


