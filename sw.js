/* Enroca — cache-first, isolated by app name and registration scope. */
'use strict';
var VERSION = 'enroca-v5';
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
  "./404.html"
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
      return key.startsWith('enroca-v') && key.endsWith(':' + SCOPE) && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(event.request, { ignoreSearch: true }).then(function (cached) {
      return cached || fetch(event.request).catch(function () {
        if (event.request.mode === 'navigate') return cache.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  }));
});
