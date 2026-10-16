/* ==========================================================================
   Ludia — Locale picker configuration.
   Must be an external file, not an inline <script>: the CSP in `_headers`
   is `script-src 'self'` with no `unsafe-inline`, so the browser blocked
   the inline block and window.LocalePickerConfig stayed undefined. The
   component then fell back to its own defaults, which cost Ludia real
   things: it probed `js/strings.<locale>.js` for languages that do not
   exist here (a 404 on every load), stored the locale under the shared
   `apptonomia:locale` key instead of Ludia's own `enroca:locale`, and
   dropped `legacyContrastClass`, so the high-contrast checkbox stopped
   applying the class the theme CSS looks for.
   Same reason assets/js/sw-register.js is an external file.
   Loaded without `defer`, so it runs before the deferred
   assets/js/locale-picker.js, exactly like the inline block it replaces.
   ========================================================================== */
window.LocalePickerConfig = {
  /* El selector de idioma va DENTRO del cajón del ⚙️, como primera
     fila, y el ⚙️ se queda solo en la cabecera. Antes vivía al lado
     del ⚙️ en la fila de controles y eran dos sitios donde cambiar
     preferencias. Coste: un clic más para llegar al idioma. */
  languageInDrawer: true,
  /* Ludia's core.js defines STORAGE_PREFIX = 'enroca:' (legacy name
     from when the app was called Enroca), so the locale lives at
     'enroca:locale' in localStorage — NOT 'ludia:locale'. We mirror
     the existing key so users who chose a language before the
     rename keep their preference, and so core.js reads back what
     the picker wrote. */
  storageKey: 'enroca:locale',
  /* Ludia keeps its strings inline in strings.*.js, so there is nothing
     to discover with HEAD requests: skip discovery and use the list. */
  path: null,
  requiredLocales: ['es', 'en'],
  defaultLocale: 'en',
  /* No settingsHref: the drawer's "more settings" link is gone. Ludia
     already reaches #settings from its own navigation, and its settings
     panel is a full page — a link to it from inside the shared drawer was
     a second door to the same room. */
  /* Game sounds already have a native on/off setting in #settings. */
  soundSettings: false,
  /* Ludia's theme CSS keys the high-contrast variant off the
     .high-contrast class on <html>. */
  legacyContrastClass: true,
  /* Ludia persists its language in enroca:settings, not enroca:locale.
     Update the app's source-of-truth setting and reload so app.js rebuilds
     the route and all translated controls in that language. */
  onChange: function (locale) {
    if (!window.App || !window.App.storage) return;
    var settings = window.App.storage.read('settings', {});
    settings.lang = locale;
    window.App.storage.write('settings', settings);
    window.location.reload();
  }
};
