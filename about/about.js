/* Ludia — «Sobre la app». Aplica el idioma a los textos data-i18n.
   Mismo orden que la app: ?lang=, luego el idioma guardado, luego el del navegador. */
(function () {
  'use strict';
  if (!window.App || !window.App.i18n) return;
  var i18n = window.App.i18n;

  function detect() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
    try {
      var saved = localStorage.getItem('ludia:locale');
      if (saved === 'es' || saved === 'en') return saved;
    } catch (_) {}
    var nav = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase().split(/[-_]/)[0];
    return nav === 'es' ? 'es' : 'en';
  }

  function apply(lang) {
    i18n.set(lang);
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = i18n.t(nodes[i].getAttribute('data-i18n'));
    document.title = i18n.t('about.pageTitle');
  }

  window.LocalePicker = window.LocalePicker || {};
  window.LocalePicker.onChange = function (lang) {
    if (lang !== 'es' && lang !== 'en') return;
    apply(lang);
    try { localStorage.setItem('ludia:locale', lang); } catch (_) {}
    var url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  };

  apply(detect());
})();
