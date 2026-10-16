'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const APP = path.basename(ROOT);
const BASE_PATH = APP === 'calculia' || APP === 'routime' ? '/site/' : '/';
const NAV_TIMEOUT = 15000;
const SETTLE_MS = 120;
const MAX_CONTROLS_PER_ROUTE = 180;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};
const EXTRA_HASH_ROUTES = {
  enroca: ['#home', '#settings', '#learn', '#exercise/all', '#minigames',
    '#play', '#privacy',
    '#minigame/rook-flag', '#minigame/bishop-flag', '#minigame/knight-flag',
    '#minigame/pawn-flag', '#minigame/rook-path', '#minigame/bishop-path',
    '#minigame/knight-path', '#minigame/pawn-capture', '#minigame/king-step',
    '#minigame/rook-shield', '#minigame/bishop-capture', '#minigame/choose-safety',
    '#ludia/tic-tac-toe', '#ludia/connect-four', '#ludia/battleship',
    '#ludia/sudoku', '#ludia/tetris', '#ludia/domino', '#ludia/checkers',
    '#ludia/tic-tac-toe/rules/0', '#ludia/tic-tac-toe/exercises/0',
    '#ludia/tic-tac-toe/play', '#ludia/tic-tac-toe/match',
    '#ludia/connect-four/rules/0', '#ludia/connect-four/exercises/0',
    '#ludia/connect-four/play', '#ludia/connect-four/match',
    '#ludia/battleship/rules/0', '#ludia/battleship/exercises/0',
    '#ludia/battleship/play', '#ludia/battleship/match',
    '#ludia/sudoku/rules/0', '#ludia/sudoku/exercises/0',
    '#ludia/sudoku/play', '#ludia/sudoku/match',
    '#ludia/tetris/rules/0', '#ludia/tetris/exercises/0',
    '#ludia/tetris/play', '#ludia/tetris/match',
    '#ludia/domino/rules/0', '#ludia/domino/exercises/0',
    '#ludia/domino/play', '#ludia/domino/match',
    '#ludia/checkers/rules/0', '#ludia/checkers/exercises/0',
    '#ludia/checkers/play', '#ludia/checkers/match'],
  okeymoney: ['#block-didactico', '#block-practica', '#block-simulacion',
    '#block-planificacion', '#block-metas', '#settings'],
  sinonimia: ['#/es/', '#/es/juego', '#/es/juego/palabra',
    '#/es/juego/frase', '#/en/', '#/en/juego'],
};
EXTRA_HASH_ROUTES.ludia = EXTRA_HASH_ROUTES.enroca;

function walk(dir, relative) {
  const result = [];
  relative = relative || '';
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'doc', 'scripts',
      'graphify-out', 'graphify-out-meta', '_mojibake_test'].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push.apply(result, walk(absolute, child));
    else result.push({ relative: child.split(path.sep).join('/') });
  }
  return result;
}

function publicRoutes() {
  const routes = walk(ROOT).filter(item => item.relative.endsWith('.html'))
    .filter(item => !item.relative.startsWith('doc/'))
    .filter(item => !item.relative.includes('/templates/'))
    .filter(item => !/(^|\/)(404|offline|refresh)\.html$/.test(item.relative))
    .map(item => {
      if (item.relative === 'index.html') return '/';
      if (item.relative.endsWith('/index.html')) return '/' + item.relative.slice(0, -10);
      return '/' + item.relative;
    });
  const hashes = (EXTRA_HASH_ROUTES[APP] || []).map(hash => BASE_PATH + hash);
  const dynamic = [];
  if (APP === 'memofun') {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'decks', 'manifest.json'), 'utf8'));
      const deck = manifest[0];
      if (deck && deck.file) {
        dynamic.push('/tools/study/index.html?deck=' + encodeURIComponent(deck.file) +
          '&id=' + encodeURIComponent(deck.id || deck.file) +
          '&titulo=' + encodeURIComponent(deck.tema || deck.topic || 'Memofun'));
      }
    } catch (error) {
      throw new Error('No se pudo preparar la baraja funcional de Memofun: ' + error.message);
    }
  }
  return Array.from(new Set([BASE_PATH].concat(routes, hashes, dynamic))).sort();
}

function startServer() {
  const server = http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent((request.url || '/').split('?')[0]); }
    catch { response.writeHead(400); response.end('Bad request'); return; }

    let filePath = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
    if (pathname === '/') filePath = path.join(ROOT, 'index.html');
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    const relative = path.relative(ROOT, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function listenForErrors(page, baseUrl) {
  const errors = { page: [], console: [], resources: [] };
  const origin = new URL(baseUrl).origin;
  page.on('pageerror', error => errors.page.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400 && url.pathname !== '/favicon.ico') {
      errors.resources.push(response.status() + ' ' + url.pathname);
    }
  });
  return errors;
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT });
  await page.waitForTimeout(SETTLE_MS);
  await page.locator('body').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
  const main = page.locator('main, #app, #contenido, #main, .container, body').first();
  assert.ok(await main.count() > 0, 'La página no contiene un contenedor principal');
  assert.ok(await main.isVisible().catch(() => false), 'El contenedor principal no es visible');
  assert.ok((await main.innerText().catch(() => '')).trim(), 'El contenedor principal está vacío');
}

/* El desplegable compartido es un panel que se abre y se cierra, asi que
   el helper tiene que abrirlo y devolver la opcion ya resuelta: un locator
   perezoso mas un guard de isVisible se habria saltado el ejercicio
   entero en silencio. Los cinco dialectos de dos botones se quedan como
   respaldo para una pagina que aun los lleve. */
async function languageLocator(page, language) {
  const btn = page.locator('#locale-picker .locale-picker-btn');
  if (await btn.count()) {
    /* Con `languageInDrawer` el desplegable vive DENTRO del cajon, asi
       que no siempre esta a la vista. No basta con abrirlo una vez al
       principio: `App.i18n.setLocale()` hace `location.reload()`, y al
       recargar el cajon vuelve a cerrarse. Se abre aqui, justo antes de
       pulsar, que es cuando puede hacer falta. El cierre lo hace
       `exerciseLanguages()` en su `finally`. */
    const drawer = page.locator('#accessibility-settings');
    if (await drawer.count() && !await drawer.isVisible().catch(() => false)) {
      await page.locator('.locale-settings-trigger').click();
      await drawer.waitFor({ state: 'visible', timeout: 5000 });
    }
    const panel = page.locator('#locale-picker .locale-picker-panel');
    if (!await panel.isVisible().catch(() => false)) await btn.click();
    return panel.locator('li[data-locale="' + language + '"]');
  }
  return page.locator([
    'button[data-locale="' + language + '"]:visible',
    'button[data-lang="' + language + '"]:visible',
    'button[data-locale-switch="' + language + '"]:visible',
    'button.idioma-btn[data-lang="' + language + '"]:visible',
    'button.lang-btn[data-lang="' + language + '"]:visible',
  ].join(', ')).first();
}

/* El desplegable es la primera fila del cajón de ajustes, asi que abrir el
   ⚙️ es parte del ejercicio de idioma —y cerrarlo tambien: el backdrop se
   queda encima y las tres funciones que van despues en runRoute() chocan
   contra el, con un fallo que aparece lejos de su causa. */
async function closeSettingsDrawer(page) {
  const drawer = page.locator('#accessibility-settings');
  if (!await drawer.count() || !await drawer.isVisible().catch(() => false)) return;
  await drawer.locator('[data-settings-close]').click().catch(() => {});
  await drawer.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

async function languageIsActive(page, button, language) {
  const lang = (await page.locator('html').getAttribute('lang')) || '';
  if (lang.toLowerCase().startsWith(language)) return true;
  if (await button.getAttribute('aria-pressed') === 'true') return true;
  /* El desplegable marca la opcion activa con aria-selected, no aria-pressed. */
  if (await button.getAttribute('aria-selected') === 'true') return true;
  return /\b(active|activo|selected|seleccionado)\b/.test(
    (await button.getAttribute('class')) || '');
}

async function exerciseLanguages(page) {
  /* Abrir el ⚙️ es cosa de `languageLocator()`, que es quien lo necesita y
     quien sabe si hace falta: entre una llamada y otra la app puede
     recargar y cerrarlo. Aquí solo se cuenta si existe, para poder
     devolverlo a su sitio al terminar con el `finally` de abajo. */
  const hasDrawer = await page.locator('#accessibility-settings').count();
  try {
    const en = await languageLocator(page, 'en');
    if (!await en.count() || !await en.isVisible().catch(() => false)) return;
    const before = await page.locator('main, #app, #contenido, #main, .container, body').first()
      .innerText().catch(() => '');
    await en.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    const after = await page.locator('main, #app, #contenido, #main, .container, body').first()
      .innerText().catch(() => '');
    /* Se vuelve a pedir la opcion: el panel se cierra al elegir, asi que la
       de antes ya no es visible. */
    const enAgain = await languageLocator(page, 'en');
    assert.ok(await languageIsActive(page, enAgain, 'en') || before !== after,
      'El selector no activa English');
    const es = await languageLocator(page, 'es');
    if (await es.count() && await es.isVisible().catch(() => false)) {
      await es.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
      const esAgain = await languageLocator(page, 'es');
      assert.ok(await languageIsActive(page, esAgain, 'es'), 'El selector no vuelve a Español');
    }
  } finally {
    if (hasDrawer) await closeSettingsDrawer(page);
  }
}

async function exerciseUnsupportedBrowserLanguage(browser, baseUrl) {
  const context = await browser.newContext({
    locale: 'fr-FR', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.waitForSelector('#locale-picker', { state: 'attached', timeout: NAV_TIMEOUT });
    const result = await page.evaluate(() => ({
      htmlLocale: (document.documentElement.lang || '').slice(0, 2).toLowerCase(),
      pickerLocale: (document.querySelector('.locale-picker-current')?.textContent || '').trim(),
    }));
    assert.strictEqual(result.htmlLocale, 'en',
      'Un navegador fr-FR debe cargar inglés cuando francés no está implementado');
    assert.strictEqual(result.pickerLocale, 'EN',
      'El selector debe mostrar EN cuando fr-FR no está implementado');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseSoundSettings(browser, baseUrl) {
  const context = await browser.newContext({
    locale: 'es-ES', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      window.__settingsTestTones = 0;
      window.AudioContext = class {
        constructor() { this.currentTime = 0; this.destination = {}; }
        createOscillator() {
          window.__settingsTestTones++;
          return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
        }
        createGain() {
          return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
        }
      };
    });
    await page.addInitScript(() => localStorage.clear());
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.locator('.locale-settings-trigger').click();
    const success = page.locator('[data-settings-success]');
    const error = page.locator('[data-settings-error]');
    await success.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await success.isChecked(), true, 'El sonido de acierto debe estar activo por defecto');
    assert.strictEqual(await error.isChecked(), false, 'El sonido de error debe estar desactivado por defecto');
    await success.uncheck();
    await error.check();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('miralante:sounds'))),
      { success: false, error: true }, 'Los sonidos deben guardarse en la configuración común');
    const audio = await page.evaluate(async () => {
      let playSuccess, playError;
      if (window.App && window.App.feedback) {
        playSuccess = () => window.App.feedback.success();
        playError = () => window.App.feedback.encourage();
      } else if (window.App && window.App.sound) {
        playSuccess = () => window.App.sound.play('success');
        playError = () => window.App.sound.play('error');
      } else {
        return null;
      }
      await playSuccess();
      await new Promise(resolve => setTimeout(resolve, 250));
      const tonesWithSuccessMuted = window.__settingsTestTones;
      await playError();
      await new Promise(resolve => setTimeout(resolve, 80));
      return { tonesWithSuccessMuted, tonesWithErrorEnabled: window.__settingsTestTones };
    });
    if (audio) {
      assert.strictEqual(audio.tonesWithSuccessMuted, 0,
        'El interruptor debe silenciar el sonido de acierto real de la app');
      assert.ok(audio.tonesWithErrorEnabled > 0,
        'El interruptor debe habilitar el sonido de error real de la app');
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseFontSizeSettings(browser, baseUrl) {
  const nativePrefs = {
    calculia: { fontSize: 'muygrande' },
    memofun: { textSize: 'extraLarge' },
    okeymoney: { textSize: 'extraLarge' },
    routime: { tamanoLetra: 'muygrande' },
  }[APP];
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await page.addInitScript(({ app, prefs }) => {
      if (!sessionStorage.getItem('__font_size_test_initialized')) {
        localStorage.clear();
        if (prefs) localStorage.setItem(app + ':prefs', JSON.stringify(prefs));
        sessionStorage.setItem('__font_size_test_initialized', 'true');
      }
    }, { app: APP, prefs: nativePrefs });
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.locator('.locale-settings-trigger').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    const scaleVariable = APP === 'calculia' || APP === 'routime' ? '--escala-texto' : '--text-scale';
    const readScale = () => page.evaluate(variable =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue(variable)), scaleVariable);
    if (nativePrefs) {
      assert.strictEqual(await readScale(), 1.3,
        'La preferencia de tamaño guardada en la app debe aplicarse al cargar');
    }
    const fontSizeBefore = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));

    await page.locator('.locale-settings-trigger').click();
    await page.locator('[data-settings-size="large"]').click();
    assert.strictEqual(await readScale(), 1.15,
      'El tamaño elegido debe cambiar la escala tipográfica visible de la app');
    const fontSizeAfter = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    assert.notStrictEqual(fontSizeAfter, fontSizeBefore,
      'El tamaño elegido debe modificar el tamaño calculado del texto de la app');
    assert.strictEqual(await page.locator('[data-settings-size="large"]').getAttribute('aria-pressed'), 'true');
    const settingsKey = APP === 'ludia' ? 'enroca:locale:accessibility' : APP + ':locale:accessibility';
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), settingsKey);
    assert.strictEqual(saved.textSize, 'large', 'El tamaño elegido debe guardarse');

    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.strictEqual(await readScale(), 1.15,
      'El tamaño elegido debe seguir aplicado tras recargar la app');
    assert.strictEqual(await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize)), fontSizeAfter,
      'El tamaño calculado del texto debe persistir tras recargar la app');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseAppearanceSettings(browser, baseUrl) {
  const context = await browser.newContext({
    serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__appearance_settings_initialized')) {
        localStorage.clear();
        sessionStorage.setItem('__appearance_settings_initialized', 'true');
      }
    });
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    const trigger = page.locator('.locale-settings-trigger');
    await trigger.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await trigger.click();
    const drawer = page.locator('#accessibility-settings');
    await drawer.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await drawer.getAttribute('aria-modal'), 'true');

    const bodyColors = () => page.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
      palette: ['--paper', '--color-bg', '--color-fondo', '--color-background',
        '--ink', '--color-text', '--color-texto'].map(name =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim()),
    }));
    await drawer.locator('[data-settings-theme="light"]').click();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'light',
      'El tema claro debe aplicarse al documento');
    const light = await bodyColors();
    await drawer.locator('[data-settings-theme="dark"]').click();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'dark',
      'El tema oscuro debe aplicarse al documento');
    const dark = await bodyColors();
    assert.notDeepEqual(dark.palette, light.palette, 'El tema debe cambiar la paleta visible de la app: ' + JSON.stringify({ dark: dark.palette, light: light.palette }));
    await drawer.locator('[data-settings-contrast]').check();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
      'Alto contraste debe activar la paleta de contraste');
    const contrast = await bodyColors();
    assert.notDeepEqual(contrast.palette, dark.palette,
      'Alto contraste debe cambiar la paleta visible respecto al tema oscuro');
    const settingsKey = await page.evaluate(() => {
      const cfg = window.LocalePickerConfig || {};
      return cfg.settingsStorageKey || ((cfg.storageKey || 'apptonomia:locale') + ':accessibility');
    });
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), settingsKey);
    assert.strictEqual(saved.theme, 'dark');
    assert.strictEqual(saved.contrast, true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.locale-settings-trigger').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
      'El alto contraste debe continuar activo después de recargar');
    /* El idioma vive DENTRO del cajón de ajustes (`languageInDrawer` en el
       config de esta app), no como control suelto en la cabecera: hay que
       abrir el ⚙️ para cambiarlo. La recarga anterior deja el cajón
       cerrado, así que se abre aquí. */
    await page.locator('.locale-settings-trigger').click();
    const languageDrawer = page.locator('#accessibility-settings');
    await languageDrawer.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });

    const languagePicker = languageDrawer.locator('.locale-picker-btn');
    await languagePicker.click();
    const english = languageDrawer.locator('.locale-picker-panel li[data-locale="en"]');
    await english.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await english.click();
    /* Choosing a language swaps the document, so for an instant there is
       no documentElement at all. The predicate has to answer "not yet"
       instead of throwing, otherwise the TypeError ends the wait instead
       of polling through the navigation. */
    await page.waitForFunction(() =>
      !!(document.documentElement && document.documentElement.lang.slice(0, 2) === 'en'),
    null, { timeout: NAV_TIMEOUT });
    assert.strictEqual((await page.locator('html').getAttribute('lang') || '').slice(0, 2), 'en',
      'El desplegable del cajón debe cambiar el idioma activo de la app');
    assert.strictEqual((await languagePicker.locator('.locale-picker-current').textContent()).trim(), 'EN');

    /* El ⚙️ se queda solo en la fila de la cabecera y el idioma, dentro.
       Se comprueba que el engranaje es el último de su fila en vez de que
       esté solo, porque esa fila puede llevar otros controles. */
    const gearRow = await page.evaluate(() => {
      const gear = document.querySelector('.locale-settings-trigger');
      const drawer = document.getElementById('accessibility-settings');
      const picker = document.getElementById('locale-picker');
      return {
        pickerInDrawer: drawer.contains(picker),
        gearIsLast: !!gear && gear.parentNode.lastElementChild === gear,
        alignsEnd: getComputedStyle(gear.parentNode).justifyContent === 'flex-end',
      };
    });
    assert.strictEqual(await page.locator('#accessibility-settings .locale-picker-btn').count(), 1,
      'El cajón debe traer el desplegable de idioma');
    assert.ok(gearRow.pickerInDrawer, 'El selector de idioma debe vivir dentro del cajón de ajustes');
    assert.ok(gearRow.gearIsLast, 'El engranaje debe quedar arriba a la derecha, el último de su fila');
    assert.ok(gearRow.alignsEnd, 'La fila de controles debe alinearse al final para quedar arriba a la derecha');
    assert.strictEqual(await page.locator('#accessibility-settings [data-settings-more]').count(), 0,
      'El cajón no debe enlazar a la página de ajustes propia del proyecto');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
} 

async function exerciseNativeSettings(browser, baseUrl) {
  const context = await browser.newContext({
    serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__native_settings_initialized')) {
        localStorage.clear();
        sessionStorage.setItem('__native_settings_initialized', 'true');
      }
      window.__nativeSettingsTones = 0;
      window.AudioContext = class {
        constructor() { this.currentTime = 0; this.destination = {}; }
        createOscillator() {
          window.__nativeSettingsTones++;
          return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
        }
        createGain() {
          return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
        }
      };
    });

    if (APP === 'calculia') {
      await page.addInitScript(() => localStorage.setItem('calculia:pairs',
        JSON.stringify({ stars: 2, completed: 1 })));
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#btnResetPersona').click();
      await page.locator('#btnResetPersona').click();
      assert.ok(await page.evaluate(() => localStorage.getItem('calculia:pairs')),
        'Restablecer datos personales debe conservar el progreso de Calculia');
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('calculia:locale')), null,
        'Restablecer datos personales debe borrar el idioma guardado');
      await page.locator('#btnResetApp').click();
      await page.locator('#btnResetApp').click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('calculia:pairs')), null,
        'Restablecer la app debe borrar el progreso de Calculia');
    } else if (APP === 'memofun') {
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#text-size-group [data-value="extraLarge"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim()), '1.3',
        'Muy grande debe cambiar la escala visible del texto');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('memofun:prefs')).textSize), 'extraLarge');
      await page.locator('#sounds-group [data-value="off"]').click();
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('memofun:prefs')).sounds), false);
      await page.evaluate(() => window.App.feedback.success());
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), 0,
        'Desactivar sonidos en Ajustes debe silenciar el sonido real de Memofun');
      await page.locator('#sounds-group [data-value="on"]').click();
      await page.evaluate(() => window.App.feedback.success());
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos en Ajustes debe habilitar el sonido real de Memofun');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }),
        page.locator('#lang-en').click(),
      ]);
      await page.waitForFunction(() => document.documentElement.lang.slice(0, 2) === 'en',
        null, { timeout: NAV_TIMEOUT });
    } else if (APP === 'okeymoney') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#btnSettings').click();
      await page.locator('#textSizeOptions [data-size="extraLarge"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim()), '1.3',
        'Muy grande debe cambiar la escala tipográfica en Okeymoney');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('okeymoney:prefs')).textSize), 'extraLarge');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExportData').click();
      const download = await downloadPromise;
      assert.match(download.suggestedFilename(), /^okeymoney-backup-.*\.json$/,
        'Exportar debe descargar una copia JSON');
    } else if (APP === 'routime') {
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#selectorTamano [data-valor="muygrande"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--escala-texto').trim()), '1.3',
        'Muy grande debe cambiar la escala tipográfica de Routime');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('routime:prefs')).tamanoLetra), 'muygrande');
      await page.locator('#selectorSonidos [data-valor="off"]').click();
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('routime:prefs')).sonidos), false);
      await page.goto(baseUrl + '/site/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), 0,
        'Desactivar sonidos debe silenciar el sonido real de Routime');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#selectorSonidos [data-valor="on"]').click();
      await page.goto(baseUrl + '/site/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos debe habilitar el sonido real de Routime');
      await page.locator('#inputOwnAddress').fill('Calle de prueba 12');
      await page.locator('#btnSaveMyDetails').click();
      assert.ok(await page.evaluate(() => Object.keys(localStorage)
        .some(key => (localStorage.getItem(key) || '').includes('Calle de prueba 12'))),
        'Guardar mis datos debe persistir la dirección en esta app');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExportar').click();
      await downloadPromise;
    } else if (APP === 'ludia') {
      await page.goto(baseUrl + '/#settings', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('[data-setting="size"]').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.locator('[data-setting="size"]').selectOption('large');
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('large-text')),
        'El tamaño grande debe activar la clase de tipografía de Ludia');
      await page.locator('[data-setting="contrast"]').check();
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('high-contrast')),
        'El contraste debe activar la paleta propia de Ludia');
      await page.locator('[data-setting="names"]').check();
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('piece-names')),
        'Mostrar nombres debe activar las etiquetas de piezas');
      await page.locator('[data-setting="sounds"]').check();
      await page.evaluate(async () => window.App.sound.play('success'));
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos debe permitir el sonido real de Ludia');
      await page.locator('[data-setting="sounds"]').uncheck();
      const mutedAt = await page.evaluate(() => window.__nativeSettingsTones);
      await page.evaluate(async () => window.App.sound.play('success'));
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), mutedAt,
        'Desactivar sonidos debe silenciar el sonido real de Ludia');
      await page.evaluate(() => window.App.storage.write('progress', { lessons: ['test'], exercises: {}, minigames: {} }));
      await page.locator('[data-action="delete-data"]').click();
      await page.locator('#confirm-action').click();
      assert.strictEqual(await page.evaluate(() =>
        Object.keys(localStorage).some(key => key.startsWith('enroca:'))), false,
        'Borrar datos debe eliminar todo el progreso y las preferencias de Ludia');
    } else if (APP === 'sinonimia') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      const before = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      await page.locator('#letra-mas').click();
      const after = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      assert.ok(after > before, 'A+ debe aumentar el texto visible de Sinonimia');
      assert.strictEqual(await page.locator('#contraste-toggle').getAttribute('aria-pressed'), 'false');
      await page.locator('#contraste-toggle').click();
      assert.strictEqual(await page.locator('#contraste-toggle').getAttribute('aria-pressed'), 'true');
      assert.strictEqual(await page.locator('body').evaluate(node => node.classList.contains('alto-contraste')), true);
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('sinonimia-contraste')), '1');
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseForms(page) {
  const items = await page.locator('input:visible, select:visible, textarea:visible')
    .evaluateAll(nodes => nodes.map((node, index) => ({
      index, tag: node.tagName, type: node.type || '',
    })));
  for (const item of items) {
    const locator = page.locator('input:visible, select:visible, textarea:visible').nth(item.index);
    if (!await locator.isVisible().catch(() => false)) continue;
    if (item.tag === 'SELECT') {
      const options = await locator.locator('option:not([disabled])').evaluateAll(nodes =>
        nodes.map(node => node.value).filter(value => value !== ''));
      if (options.length) await locator.selectOption(options[0]);
    } else if (item.type === 'file') {
      continue;
    } else if (item.type === 'checkbox' || item.type === 'radio') {
      if (!await locator.isChecked().catch(() => false)) await locator.check();
    } else if (item.type === 'range') {
      await locator.press('ArrowRight').catch(() => {});
    } else if (item.type === 'date') {
      await locator.fill('2026-01-15');
    } else if (item.type === 'number') {
      await locator.fill('1');
    } else {
      await locator.fill('prueba');
    }
  }
}

const ANSWER_SELECTOR = [
  'button.game-option:visible', 'button.btn-opcion:visible',
  'button.option-btn:visible', '.course-answers button:visible',
  '#options button:visible', '#quizOptions button:visible',
  '#chatOpciones button:visible', '#opcionesSaber button:visible',
  '#opcionesReconocer button:visible', '#choiceOptions button:visible',
  '[data-action="answer"]:visible',
].join(', ');
const NEXT_SELECTOR = [
  '#btnNext:visible', '#btnNextQuiz:visible', '#btnNextPay:visible',
  '#btnSiguienteSaber:visible', '#btnSiguienteReconocer:visible',
  '#nextFact:visible', '#nextCardBtn:visible', '#nextBtn:visible',
  '#juego-siguiente:visible', '[data-action="next"]:visible',
].join(', ');

async function clickFirstVisible(page, selector) {
  const locators = page.locator(selector);
  const count = await locators.count();
  for (let i = 0; i < count; i += 1) {
    const locator = locators.nth(i);
    if (!await locator.isVisible().catch(() => false)) continue;
    if (!await locator.isEnabled().catch(() => true)) continue;
    await locator.click({ timeout: 3000, force: true });
    await page.waitForTimeout(SETTLE_MS);
    return true;
  }
  return false;
}

async function answerVisibleQuestions(page, maxRounds) {
  let interactions = 0;
  for (let round = 0; round < (maxRounds || 8); round += 1) {
    const options = page.locator(ANSWER_SELECTOR);
    const count = await options.count();
    if (!count) break;
    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      if (!await option.isVisible().catch(() => false)) continue;
      if (!await option.isEnabled().catch(() => false)) continue;
      await option.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
    }
    const next = page.locator(NEXT_SELECTOR).first();
    if (await next.isVisible().catch(() => false) &&
        await next.isEnabled().catch(() => true)) {
      await next.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
      continue;
    }
    const ludiaNext = page.locator('a[href*="/exercises/"], [data-ludia="next-rule"]')
      .first();
    if (await ludiaNext.isVisible().catch(() => false)) {
      await ludiaNext.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
      continue;
    }
    break;
  }
  return interactions;
}

async function exerciseApptonomiaProject(page) {
  const next = page.locator('#btnNext').first();
  if (!await next.count() || !await next.isVisible().catch(() => false)) return 0;
  const total = await page.locator('.deck-stage > .slide').count() || 12;
  let moved = 0;
  for (let i = 0; i < total * 2; i += 1) {
    if (!await next.isVisible().catch(() => false) ||
        !await next.isEnabled().catch(() => false)) break;
    await next.click({ timeout: 3000, force: true });
    moved += 1;
    await page.waitForTimeout(650);
    if (Number.parseInt(await page.locator('#slideNumFoot').innerText(), 10) >= total) break;
  }
  assert.ok(moved >= Math.max(1, total - 1),
    'La presentación no recorre todas sus diapositivas');
  assert.equal(Number.parseInt(await page.locator('#slideNumFoot').innerText(), 10), total,
    'La presentación no termina en la última diapositiva');
  await clickFirstVisible(page, '#btnPrev');
  await page.keyboard.press('ArrowRight');
  await clickFirstVisible(page, '#btnPrint');
  return 1;
}

async function exerciseMemofunStudy(page) {
  const reveal = page.locator('#btn-reveal').first();
  const next = page.locator('#btn-next').first();
  if (!await reveal.count() || !await next.count() ||
      !await reveal.isVisible().catch(() => false)) return 0;
  let cards = 0;
  for (let i = 0; i < 200; i += 1) {
    if (await reveal.isVisible().catch(() => false)) {
      await reveal.click({ timeout: 3000, force: true });
      await page.waitForTimeout(220);
    }
    if (!await next.isVisible().catch(() => false)) break;
    await next.click({ timeout: 3000, force: true });
    cards += 1;
    await page.waitForTimeout(220);
  }
  assert.ok(await page.locator('#end-screen:not(.hidden)').count(),
    'Memofun no muestra la pantalla de finalización de la baraja');
  await clickFirstVisible(page, '#btn-study-again');
  return cards ? 1 : 0;
}

async function exerciseSinonimia(page, route) {
  let actions = 0;
  await clickFirstVisible(page, '#letra-mas');
  await clickFirstVisible(page, '#letra-menos');
  await clickFirstVisible(page, '#letra-normal');
  await clickFirstVisible(page, '#contraste-toggle');
  await clickFirstVisible(page, '#contraste-toggle');
  if (route.includes('/juego/')) {
    actions += await answerVisibleQuestions(page, 10);
    assert.ok(actions > 0, 'El juego de Sinonimia no permite responder ninguna pregunta');
    return actions ? 1 : 0;
  }
  const search = page.locator('#search').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill('a');
    await page.waitForTimeout(SETTLE_MS);
    assert.ok(await page.locator('#word-list .card').count() ||
      await page.locator('#no-results:not([hidden])').count(),
      'La búsqueda de Sinonimia no produce estado visible');
    const filter = page.locator('.filter-btn').nth(1);
    if (await filter.isVisible().catch(() => false)) { await filter.click(); actions += 1; }
    const alphabet = page.locator('#alphabet button:not([disabled])').first();
    if (await alphabet.isVisible().catch(() => false)) { await alphabet.click(); actions += 1; }
    const word = page.locator('a[href*="/word/"]').first();
    if (await word.isVisible().catch(() => false)) {
      await word.click();
      await page.waitForTimeout(SETTLE_MS);
      assert.ok(await page.locator('#detail-view:not([hidden])').count(),
        'La tarjeta de palabra no abre el detalle');
      actions += 1;
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
    }
    await clickFirstVisible(page, '#surpriseMe');
    actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseEnroca(page, route) {
  if (!route.includes('#')) return 0;
  let actions = 0;
  if (route.includes('/rules/')) {
    for (let i = 0; i < 20; i += 1) {
      if (!await clickFirstVisible(page, '[data-ludia="demo"], [data-ludia="next-rule"]')) break;
      actions += 1;
    }
  } else if (route.includes('/exercises/')) {
    actions += await answerVisibleQuestions(page, 32);
  } else if (route.endsWith('/play')) {
    if (await clickFirstVisible(page, '#ludia-setup button[type="submit"]')) {
      actions += 1;
      for (let i = 0; i < 3; i += 1) {
        const cell = page.locator('[data-cell]:visible').first();
        if (!await cell.isVisible().catch(() => false) ||
            !await cell.isEnabled().catch(() => false)) break;
        await cell.click({ timeout: 3000, force: true });
        actions += 1;
        await page.waitForTimeout(SETTLE_MS);
      }
      await clickFirstVisible(page, '[data-ludia="hint"], [data-ludia="undo"]');
    }
  } else if (route.includes('/minigame/')) {
    actions += await answerVisibleQuestions(page, 16);
    await clickFirstVisible(page, '[data-action="next"], [data-action="restart"]');
  } else {
    await clickFirstVisible(page, 'a[href*="/rules/"], a[href*="/exercises/"], a[href*="/play"]');
    actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseOkeymoney(page) {
  let actions = 0;
  const startSelectors = [
    '#nextStepAction', '#activityCatalog button', '#didacticLessons button',
    '#simulationCatalog button', '#financialCycle button',
    '.tarjeta button', '.btn-option', '#btnStartActivity',
  ].join(', ');
  if (await clickFirstVisible(page, startSelectors)) actions += 1;
  actions += await answerVisibleQuestions(page, 32);
  for (const selector of ['#wizNext', '#purchaseNext', '#wizSave', '#wizClose', '#wizBack']) {
    if (await clickFirstVisible(page, selector)) actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseActivityApp(page) {
  let actions = 0;
  const starter = [
    '.btn-nivel', '[data-activity]', '.activity-card button',
    '.tarjeta-actividad button', '#startButton', '#btnStart',
    '#btnStartActivity', '.btn-play', '.btn-actividad', '.btn-mode',
    '.btn-jugar', '.menu-grid button', '#optionsGrid .option-btn',
    '#btnConfirmSet',
  ].join(', ');
  if (await clickFirstVisible(page, starter)) actions += 1;
  actions += await answerVisibleQuestions(page, 32);
  return actions ? 1 : 0;
}

async function exerciseFullFunctionality(page, route) {
  if (APP === 'apptonomia' && route.includes('/project/')) {
    return exerciseApptonomiaProject(page);
  }
  if (APP === 'memofun' && route.includes('/tools/study/')) {
    return exerciseMemofunStudy(page);
  }
  if (APP === 'sinonimia') return exerciseSinonimia(page, route);
  if (APP === 'enroca' || APP === 'ludia') return exerciseEnroca(page, route);
  if (APP === 'okeymoney') return exerciseOkeymoney(page);
  if (APP === 'calculia' || APP === 'routime') return exerciseActivityApp(page);
  return 0;
}

/* Pulsa un control tolerando las transiciones. El recorrido pulsa y solo
   espera 25 ms, asi que el control siguiente puede medirse mientras un
   panel se abre o una tarjeta crece: Playwright lo rechaza con 'Element is
   outside of the viewport' aunque la app este perfectamente bien. Se deja
   que la animacion se detenga, se mete el elemento en el viewport a
   proposito y se reintenta. Devuelve si el control quedo pulsado. */
async function clickControl(page, locator) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await locator.click({ timeout: 2000, force: true });
      return true;
    } catch (error) {
      if (!await locator.isVisible().catch(() => false)) return false;
      await locator.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
      try {
        await locator.click({ timeout: 2000, force: true });
        return true;
      } catch (retryError) {
        await page.waitForTimeout(220);
      }
    }
  }
  return false;
}

async function exerciseControls(page) {
  const seen = new Set();
  let actions = 0;
  for (let round = 0; round < 12 && actions < MAX_CONTROLS_PER_ROUTE; round += 1) {
    const state = await page.evaluate(() => {
      const root = document.querySelector('main') || document.body;
      return location.hash + '|' + (root.innerText || '').slice(0, 600);
    }).catch(() => '');
    const controls = await page.locator('button:visible, summary:visible, a[href^="#"]:visible')
      .evaluateAll(nodes => {
        let buttonIndex = 0, summaryIndex = 0, anchorIndex = 0;
        return nodes.map(node => {
          const item = {
            tag: node.tagName, id: node.id || '',
            text: (node.innerText || node.getAttribute('aria-label') || '').trim().slice(0, 100),
            href: node.getAttribute('href') || '',
            disabled: node.disabled === true || node.getAttribute('aria-disabled') === 'true',
            language: Boolean(node.matches('[data-locale], [data-lang], [data-locale-switch]')),
          };
          if (item.tag === 'BUTTON') item.index = buttonIndex++;
          else if (item.tag === 'SUMMARY') item.index = summaryIndex++;
          else item.index = anchorIndex++;
          return item;
        });
      });
    if (!controls.length) break;

    for (const control of controls) {
      if (actions >= MAX_CONTROLS_PER_ROUTE || control.disabled || control.language) continue;
      const identity = state + '|' + control.tag + '|' + control.id + '|' +
        control.href + '|' + control.text;
      if (seen.has(identity)) continue;
      const selector = control.tag === 'BUTTON' ? 'button:visible' :
        control.tag === 'SUMMARY' ? 'summary:visible' : 'a[href^="#"]:visible';
      const locator = page.locator(selector).nth(control.index);
      if (!await locator.isVisible().catch(() => false)) continue;
      await settleDrawerTransition(page);
      /* El indice sale de una foto del DOM y el recorrido va pulsando: en
         cuanto se pulsa un control la vista puede cambiar (una carta abre un
         panel, un boton navega) y 'button:visible' ya no es la misma lista,
         de modo que .nth(control.index) resuelve un elemento DISTINTO del
         inventariado. Sin esta comprobacion el smoke accuse a la app de un
         boton que no podia pulsar: el indice caduco, no se rompio nada. Si el
         elemento que resuelve el indice ya no es el del inventario se salta,
         y se reintenta en la ronda siguiente con el DOM ya refrescado. */
      const stillInventoried = await locator.evaluate((node, expected) => {
        const text = (node.innerText || node.getAttribute('aria-label') || '').trim().slice(0, 100);
        return node.tagName === expected.tag &&
          (node.id || '') === expected.id &&
          (node.getAttribute('href') || '') === expected.href &&
          text === expected.text;
      }, control).catch(() => false);
      if (!stillInventoried) continue;
      /* Solo se marca como visto lo que se ha pulsado de verdad. Marcandolo
         antes de comprobar el indice, el control se saltaba y no volvia a
         intentarse en ninguna de las 12 rondas: el smoke dejaba de fallar
         pero tambien dejaba de probar (medido: -54% de interacciones). */
      seen.add(identity);
      try {
        if (control.tag === 'A') await locator.evaluate(node => node.click());
        else await locator.click({ timeout: 2000, force: true });
        actions += 1;
        await page.waitForTimeout(25);
      } catch (error) {
        /* Si el elemento sigue en pantalla tras el fallo, se reintenta una
           vez dejandolo entrar en el viewport antes de declararlo fallo
           real. El error tipico es 'Element is outside of the viewport'
           por una transicion a medias, no un boton roto (lo reproducia
           okeymoney en /#block-practica con #unidad-bankProducts, que un
           clic de verdad si acepta). */
        if (!await locator.isVisible().catch(() => false)) continue;
        if (await clickControl(page, locator)) {
          actions += 1;
          await page.waitForTimeout(25);
          continue;
        }
        throw new Error('No se pudo activar ' + control.tag + '#' +
          (control.id || '(sin id)') + ' "' + control.text + '": ' + error.message);
      }
    }
  }
  return actions;
}

/* El cajon de ajustes compartido entra deslizando 160 ms. En cuanto se
   pulsa el engranaje sus botones ya son :visible para el navegador
   (visibility cambia con la clase) pero el transform todavia no los ha
   metido dentro del viewport, de modo que el clic siguiente revienta con
   'Element is outside of the viewport'. Aqui se espera a que el cajon
   termine de entrar. Sin esto el recorrido de controles falla en las
   paginas donde el engranaje cae entre los primeros botones. */
async function settleDrawerTransition(page) {
  await page.evaluate(() => new Promise((done) => {
    const drawer = document.querySelector('.locale-settings-drawer.is-open');
    if (!drawer) return done();
    const inside = () => {
      const r = drawer.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth + 1;
    };
    if (inside()) return done();
    const onEnd = () => {
      if (inside()) { drawer.removeEventListener('transitionend', onEnd); done(); }
    };
    drawer.addEventListener('transitionend', onEnd);
    setTimeout(() => { drawer.removeEventListener('transitionend', onEnd); done(); }, 600);
  }));
}

async function validateLinks(page, baseUrl) {
  const hrefs = await page.locator('a[href]').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute('href')).filter(Boolean));
  const links = Array.from(new Set(hrefs)).map(href => {
    try { return new URL(href, page.url()); } catch { return null; }
  }).filter(url => url && url.origin === new URL(baseUrl).origin &&
    url.pathname !== '/favicon.ico');
  for (const url of links) {
    let response;
    try {
      response = await fetch(url.href, { redirect: 'manual' });
    } catch (error) {
      throw new Error('No se pudo comprobar el enlace interno ' + url.href +
        ': ' + error.message);
    }
    assert.ok(response.status < 400,
      'Enlace interno roto (' + response.status + '): ' + url.pathname);
  }
}

async function runRoute(browser, baseUrl, route) {
  const context = await browser.newContext({
    locale: 'es-ES', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  const errors = listenForErrors(page, baseUrl);
  page.on('dialog', dialog => dialog.dismiss());
  page.on('download', download => download.cancel().catch(() => {}));
  try {
    const response = await page.goto(baseUrl + route, {
      waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT,
    });
    assert.ok(response, 'Sin respuesta al navegar a ' + route);
    assert.ok(response.status() < 400,
      'La navegación a ' + route + ' devuelve ' + response.status());
    await waitForApp(page);
    await validateLinks(page, baseUrl);
    await exerciseLanguages(page);
    await exerciseForms(page);
    if (route.includes('#')) {
      await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await waitForApp(page);
    }
    const journeys = await exerciseFullFunctionality(page, route);
    const count = await exerciseControls(page);
    assert.deepEqual(errors.page, [], 'Errores de página: ' + errors.page.join('; '));
    assert.deepEqual(errors.console, [], 'Errores de consola: ' + errors.console.join('; '));
    assert.deepEqual(errors.resources, [], 'Recursos rotos: ' + errors.resources.join('; '));
    return { count, journeys };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function main() {
  const allRoutes = publicRoutes();
  const requestedRoutes = process.argv.slice(2);
  const routes = requestedRoutes.length
    ? allRoutes.filter(route => requestedRoutes.includes(route) || requestedRoutes.some(request =>
      request !== '/' && route.includes(request)))
    : allRoutes;
  assert.ok(routes.length, 'No se han descubierto rutas HTML públicas');
  const server = await startServer();
  const address = server.address();
  const baseUrl = 'http://127.0.0.1:' + address.port;
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  let tested = 0, controls = 0, journeys = 0;
  try {
    if (['ludia', 'memofun', 'routime'].includes(APP)) {
      process.stdout.write('\n[' + APP + '] app-specific sound settings covered below');
    } else {
      await exerciseSoundSettings(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] sound settings OK');
    }
    await exerciseFontSizeSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] font-size settings OK');
    await exerciseAppearanceSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] theme/contrast/language settings OK');
    await exerciseNativeSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] native settings OK');
    if (process.env.UI_SMOKE_SETTINGS_ONLY !== '1') {
      await exerciseUnsupportedBrowserLanguage(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] fr-FR fallback OK');
    }
    for (const route of (process.env.UI_SMOKE_SETTINGS_ONLY === '1' ? [] : routes)) {
      process.stdout.write('\n[' + APP + '] ' + route + ' ');
      try {
        const result = await runRoute(browser, baseUrl, route);
        tested += 1; controls += result.count; journeys += result.journeys;
        process.stdout.write('OK (' + result.count + ' controles, ' + result.journeys + ' recorridos)');
      } catch (error) {
        failures.push({ route, message: error.stack || error.message });
        process.stdout.write('FAIL');
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (failures.length) {
    console.error('\n\nUI Playwright FAIL: ' + failures.length + ' de ' + routes.length + ' rutas');
    for (const failure of failures) {
      console.error('\n--- ' + failure.route + '\n' + failure.message);
    }
    process.exitCode = 1;
    return;
  }
  console.log('\n\nUI Playwright PASS: ' + tested + ' rutas, ' + controls +
    ' interacciones, ' + journeys + ' recorridos funcionales completos, idiomas ES/EN cuando están disponibles');
}

main().catch(error => {
  console.error('UI Playwright FAIL: ' + (error.stack || error.message));
  process.exitCode = 1;
});
