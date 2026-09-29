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

function languageLocator(page, language) {
  return page.locator([
    'button[data-locale="' + language + '"]:visible',
    'button[data-lang="' + language + '"]:visible',
    'button[data-locale-switch="' + language + '"]:visible',
    'button.idioma-btn[data-lang="' + language + '"]:visible',
    'button.lang-btn[data-lang="' + language + '"]:visible',
  ].join(', ')).first();
}

async function languageIsActive(page, button, language) {
  const lang = (await page.locator('html').getAttribute('lang')) || '';
  if (lang.toLowerCase().startsWith(language)) return true;
  if (await button.getAttribute('aria-pressed') === 'true') return true;
  return /\b(active|activo|selected|seleccionado)\b/.test(
    (await button.getAttribute('class')) || '');
}

async function exerciseLanguages(page) {
  const en = languageLocator(page, 'en');
  const es = languageLocator(page, 'es');
  if (!await en.count() || !await en.isVisible().catch(() => false)) return;
  const before = await page.locator('main, #app, #contenido, #main, .container, body').first()
    .innerText().catch(() => '');
  await en.click();
  await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
  const after = await page.locator('main, #app, #contenido, #main, .container, body').first()
    .innerText().catch(() => '');
  assert.ok(await languageIsActive(page, en, 'en') || before !== after,
    'El selector no activa English');
  if (await es.count() && await es.isVisible().catch(() => false)) {
    await es.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    assert.ok(await languageIsActive(page, es, 'es'), 'El selector no vuelve a Español');
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
  if (APP === 'enroca') return exerciseEnroca(page, route);
  if (APP === 'okeymoney') return exerciseOkeymoney(page);
  if (APP === 'calculia' || APP === 'routime') return exerciseActivityApp(page);
  return 0;
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
      seen.add(identity);
      const selector = control.tag === 'BUTTON' ? 'button:visible' :
        control.tag === 'SUMMARY' ? 'summary:visible' : 'a[href^="#"]:visible';
      const locator = page.locator(selector).nth(control.index);
      if (!await locator.isVisible().catch(() => false)) continue;
      try {
        if (control.tag === 'A') await locator.evaluate(node => node.click());
        else await locator.click({ timeout: 2000, force: true });
        actions += 1;
        await page.waitForTimeout(25);
      } catch (error) {
        if (await locator.isVisible().catch(() => false)) {
          throw new Error('No se pudo activar ' + control.tag + '#' +
            (control.id || '(sin id)') + ' "' + control.text + '": ' + error.message);
        }
      }
    }
  }
  return actions;
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
    await exerciseSoundSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] sound settings OK');
    await exerciseUnsupportedBrowserLanguage(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] fr-FR fallback OK');
    for (const route of routes) {
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
