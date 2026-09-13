/* Optional local browser QA. Uses an already installed Playwright; no install/build. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path'), fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const lessons = require('../data.js');
const C = require('../chess.js');
const url = process.env.ENROCA_TEST_URL || 'http://127.0.0.1:8099/';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, locale: 'es-ES' });
  await context.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { get() { throw new Error('Narration was accessed'); } }); });
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(url).origin) external.push(request.url()); });
  const go = async hash => { await page.goto(url + '#' + hash); await page.locator('main h1').waitFor(); };
  const stored = key => page.evaluate(key => JSON.parse(localStorage.getItem('enroca:' + key)), key);
  const act = name => page.locator('[data-action="' + name + '"]');
  const clickSquare = s => page.locator('[data-square="' + C.index(s) + '"]').click();
  try {
    await go('learn');
    assert.equal(await page.locator('.topic-group').count(), 3);
    assert.equal(await page.locator('.lesson-card').count(), 14);
    assert.deepEqual(await page.locator('.top-nav a').allTextContents(), ['Juegos']);
    assert.deepEqual(await page.locator('.chess-navigation a').allTextContents(), ['Ajedrez','Reglas','Ejercicios','Retos','Jugar']);
    const captures = process.env.ENROCA_SCREENSHOTS;
    if (captures) { fs.mkdirSync(captures, { recursive: true }); await page.screenshot({ path: path.join(captures, 'home-desktop.png'), fullPage: true }); }
    await page.locator('a[href="#lesson/board/0"]').click();
    const heading = await page.locator('main h1').innerText();
    await page.locator('a[href="#lesson/board/1"]').click();
    assert.equal(await page.locator('.square.selected .coord').innerText(), 'a1');
    await page.locator('a[href="#lesson/board/2"]').click();
    await page.waitForFunction(() => document.querySelector('.lesson-instruction')?.textContent === 'Toca a1.');
    assert.equal(await page.locator('main h1').innerText(), heading);
    assert.equal(await page.locator('.lesson-instruction').innerText(), 'Toca a1.');
    await clickSquare('b2');
    assert.equal(await act('next-exercise').count(), 0);
    await act('exercise-hint').click(); await clickSquare('a1');
    assert.equal((await stored('progress')).exercises['board-a1'], 'supported');
    assert.equal(await page.locator('.feedback').innerText(), '✓ ¡Bien!');
    await act('next-exercise').click();
    await act('review-lesson').click(); await act('return-exercise').click(); await page.waitForFunction(() => document.querySelector('.lesson-instruction')?.textContent === 'Toca c3.');
    assert.equal(await page.locator('.lesson-instruction').innerText(), 'Toca c3.');
    await page.locator('.list-controls summary').click(); await page.locator('[data-list-to]').selectOption(String(C.index('c3'))); await act('list-move').click(); await act('next-exercise').click();
    await clickSquare('h1'); await act('next-exercise').click();
    await page.locator('.complete').waitFor();
    assert.ok((await stored('progress')).lessons.includes('board'));
    console.log('✓ Continuous topic: presentation, locating squares, hints and return');
    for (const lesson of lessons) {
      await go('lesson/' + lesson.id + '/0');
      const topic = await page.locator('main h1').innerText();
      for (let step = 1; step <= lesson.steps; step++) await page.locator('a[href="#lesson/' + lesson.id + '/' + step + '"]').click();
      for (const q of lesson.exercises) {
        assert.equal(await page.locator('main h1').innerText(), topic);
        if (q.type === 'choice') await page.locator('[data-answer="' + q.answer + '"]').click();
        else if (q.type === 'locate') await clickSquare(q.to);
        else { await clickSquare(q.from); await clickSquare(q.to); }
        await act('next-exercise').click();
      }
      await page.locator('.complete').waitFor();
    }
    assert.equal(Object.keys((await stored('progress')).exercises).length, 29);
    assert.equal((await stored('progress')).exercises['board-a1'], 'independent');
    assert.equal(await page.evaluate(() => App.sound.context), null);
    console.log('✓ All 14 topics / 29 tasks complete; silence by default');
    await go('settings'); await page.locator('[data-setting="sounds"]').check();
    await page.waitForFunction(() => App.sound.context !== null);
    await page.locator('[data-setting="sounds"]').uncheck();
    assert.equal(await page.evaluate(() => App.sound.active.size), 0);
    assert.equal((await stored('settings')).sounds, false);
    console.log('✓ Optional game sounds and immediate mute');
    await go('play'); await page.locator('input[value="full"]').check(); await page.locator('input[value="local"]').check();
    await page.locator('#game-setup button[type="submit"]').click(); await page.locator('.board[role="grid"]').waitFor();
    await clickSquare('e2'); assert.equal(await page.locator('.destination').count(), 2);
    assert.equal(await page.locator('.list-controls').getAttribute('open'), null, 'Board moves do not open optional controls');
    await clickSquare('e5'); assert.equal((await stored('game')).moves.length, 0);
    await clickSquare('e4'); assert.equal((await stored('game')).moves.length, 1);
    await clickSquare('e7'); await clickSquare('e5');
    await page.reload(); await page.locator('.board').waitFor(); assert.equal((await stored('game')).moves.length, 2);
    await act('undo').click(); assert.equal((await stored('game')).moves.length, 1);
    await clickSquare('g8'); await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.square), String(C.index('g7')));
    await page.keyboard.press('Escape'); assert.equal(await page.locator('.square.selected').count(), 0);
    await page.locator('.skip-link').focus(); await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#game');
    console.log('✓ Legal/illegal moves, two players, resume, undo and board keyboard');
    await page.locator('.list-controls summary').click();
    await page.locator('[data-list-from]').selectOption(String(C.index('e7')));
    await page.locator('[data-list-to]').selectOption(String(C.index('e5')));
    await act('list-move').click(); assert.equal((await stored('game')).moves.length, 2);
    console.log('✓ Large-control alternative can play a move');
    await go('play'); await page.locator('input[value="full"]').check();
    await page.locator('#game-setup button[type="submit"]').click();
    await act('close-dialog').click(); assert.equal((await stored('game')).moves.length, 2);
    await page.locator('#game-setup button[type="submit"]').click(); await page.locator('#confirm-action').click();
    await clickSquare('d2'); await clickSquare('d4');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('enroca:game')).moves.length === 2);
    await act('undo').click(); assert.equal((await stored('game')).moves.length, 0);
    await clickSquare('e2'); await clickSquare('e4'); await act('undo').click();
    await page.waitForTimeout(850); assert.equal((await stored('game')).moves.length, 0);
    await clickSquare('e2'); await clickSquare('e4'); await page.locator('a[data-nav="home"]').click();
    await page.waitForTimeout(850); assert.equal((await stored('game')).moves.length, 1);
    await go('game'); await page.waitForFunction(() => JSON.parse(localStorage.getItem('enroca:game')).moves.length === 2);
    console.log('✓ Computer move, pair undo, pending-turn cancellation and resume');
    // Restore only a legal history to exercise the promotion modal.
    const pairs = [['d2','d4'],['e8','f8'],['d4','d5'],['f8','g8'],['d5','d6'],['g8','f8'],['d6','e7'],['f8','g8']];
    let state = C.fromFEN(C.MINI); const moves = [];
    for (const [a, b] of pairs) { const m = { from: C.index(a), to: C.index(b) }; const result = C.play(state, m); assert.ok(result, a + b); state = result.state; moves.push(m); }
    await page.evaluate(moves => localStorage.setItem('enroca:game', JSON.stringify({ mode:'mini', partner:'local', moves })), moves);
    await page.reload(); await page.locator('.board').waitFor(); await clickSquare('e7'); await clickSquare('e8');
    assert.equal(await page.locator('[data-promotion]').count(), 4);
    await page.keyboard.press('Escape'); assert.equal((await stored('game')).moves.length, 8);
    await clickSquare('e8'); await page.locator('[data-promotion="n"]').click();
    assert.equal((await stored('game')).moves.at(-1).promotion, 'n');
    console.log('✓ Explicit promotion, cancel and underpromotion');
    // Responsive checks include both languages and larger text on key screens.
    for (const lang of ['es', 'en']) {
      await go('settings'); await page.locator('[data-setting="lang"]').selectOption(lang);
      await page.locator('[data-setting="size"]').selectOption('large');
      await page.locator('[data-setting="contrast"]').check();
      await page.locator('[data-setting="names"]').check();
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        for (const hash of ['home','learn','lesson/knight/1','lesson/board/2','practice','play','game','settings','privacy']) {
          await page.goto(url + '?lang=' + lang + '#' + hash); await page.locator('main h1').waitFor();
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          assert.equal(overflow, false, lang + ' ' + width + ' ' + hash + ' overflow');
          assert.equal(await page.locator('html').getAttribute('lang'), lang);
          assert.equal(/con ayuda|sin pista|Aprende|Practica|Juega|with help|without hints|Listen|Escuchar/.test(await page.locator('body').innerText()), false, 'No design phases, support labels or narration');
          assert.equal(await page.locator('main').innerText().then(s => /\b(?:lesson|practice|play|home)\.[a-z]/.test(s)), false);
        }
      }
    }
    console.log('✓ ES/EN + large text + contrast + names at 320/375/768/1280px');
    await go('settings'); await page.locator('[data-setting="lang"]').selectOption('es');
    await page.locator('[data-setting="size"]').selectOption('regular'); await page.locator('[data-setting="contrast"]').uncheck(); await page.locator('[data-setting="names"]').uncheck();
    if (captures) { await go('game'); await page.screenshot({ path: path.join(captures, 'game-desktop.png'), fullPage: true }); await page.setViewportSize({ width:375,height:900 }); await go('home'); await page.screenshot({ path: path.join(captures,'home-mobile.png'),fullPage:true }); }
    await page.evaluate(() => localStorage.setItem('another-app:keep', 'yes'));
    await go('settings'); await act('delete-data').click(); await act('close-dialog').click();
    assert.ok(await stored('progress'));
    await act('delete-data').click(); await page.locator('#confirm-action').click();
    assert.equal(await stored('progress'), null); assert.equal(await stored('game'), null);
    assert.equal(await page.evaluate(() => localStorage.getItem('another-app:keep')), 'yes');
    console.log('✓ Confirmed reset leaves other apps intact');
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active, null, { timeout: 15000 });
    await page.reload(); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const cacheCount = await page.evaluate(async () => { const name = (await caches.keys()).find(k => k.startsWith('enroca-v')); return (await (await caches.open(name)).keys()).length; });
    assert.ok(cacheCount >= 17);
    await context.setOffline(true); await go('lesson/rook/0'); await act('example').click();
    await go('play'); await page.locator('#game-setup button[type="submit"]').click(); await clickSquare('d2'); await clickSquare('d4');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('enroca:game')).moves.length === 2);
    await context.setOffline(false);
    assert.equal(external.length, 0, 'External runtime requests: ' + external.join(', '));
    assert.deepEqual(errors, []);
    console.log('✓ Offline lessons/game, complete precache, no external runtime requests/errors');
    const blocked = await browser.newContext({ locale:'es-ES' });
    await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }); });
    const blockedPage = await blocked.newPage(); await blockedPage.goto(url + '#play');
    await blockedPage.locator('#game-setup button[type="submit"]').click();
    await blockedPage.locator('.board').waitFor(); assert.equal(await blockedPage.locator('#storage-notice').isVisible(), true);
    await blocked.close();
    const corrupt = await browser.newContext();
    await corrupt.addInitScript(() => { localStorage.setItem('enroca:progress', '{broken'); localStorage.setItem('enroca:game', JSON.stringify({ mode:'full',partner:'local',moves:[{from:0,to:63}] })); });
    const corruptPage = await corrupt.newPage(); await corruptPage.goto(url + '#play');
    assert.equal(await corruptPage.locator('a[href="#game"]').count(), 0); await corrupt.close();
    const direct = await browser.newPage(); await direct.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'));
    await direct.locator('.game-card').first().waitFor(); await direct.locator('.game-card[href="#ludia/chess"]').click(); await direct.locator('.phase-card[href="#play"]').click();
    await direct.locator('#game-setup button[type="submit"]').click(); await direct.locator('.board').waitFor();
    console.log('✓ Blocked/corrupt storage and direct-file use');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
