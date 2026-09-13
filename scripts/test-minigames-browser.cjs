/* Optional end-to-end mini-game QA using an already installed Playwright. */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const M = require('../minigames.js'), C = require('../chess.js');
const url = process.env.ENROCA_TEST_URL || 'http://127.0.0.1:8099/';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, locale: 'es-ES' });
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== new URL(url).origin) external.push(req.url()); });
  const go = async hash => { await page.goto(url + '#' + hash); await page.locator('main h1').waitFor(); };
  const act = name => page.locator('[data-action="' + name + '"]');
  const square = s => page.locator('[data-square="' + (typeof s === 'number' ? s : C.index(s)) + '"]');
  const solve = async id => { for (const move of M.solution(M.start(id))) { await square(move.from).click(); await square(move.to).click(); } };
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('enroca:progress')));
  try {
    await go('learn');
    await page.evaluate(() => localStorage.setItem('enroca:progress', JSON.stringify({ lessons: ['board'], exercises: { 'rook-0': 'independent' } })));
    await page.reload();
    await page.locator('.mini-banner a').click();
    assert.equal(await page.locator('.mini-group').count(), 3);
    assert.equal(await page.locator('a[href^="#minigame/"]').count(), 12);
    assert.equal(await page.locator('[data-nav="practice"]').getAttribute('aria-current'), 'page');
    await page.locator('a[href="#minigame/rook-flag"]').click();
    assert.equal(await square('a1').getAttribute('tabindex'), '0');
    assert.equal(await page.locator('[role="gridcell"]').count(), 16);
    assert.match(await square('a4').getAttribute('aria-label'), /bandera/);
    await square('a1').focus(); await page.keyboard.press('Home');
    assert.equal(await page.locator(':focus').getAttribute('data-square'), String(C.index('a1')));
    await page.keyboard.press('Control+Home');
    assert.equal(await page.locator(':focus').getAttribute('data-square'), String(C.index('a4')));
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator(':focus').getAttribute('data-square'), String(C.index('a4')));
    await page.keyboard.press('Control+End');
    assert.equal(await page.locator(':focus').getAttribute('data-square'), String(C.index('d1')));
    await square('a1').click(); await square('b2').click();
    assert.ok(await square('a1').locator('svg').count());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.square.selected').count(), 0);
    await solve('rook-flag');
    assert.equal((await progress()).minigames['rook-flag'], 'supported');
    assert.equal(await page.locator(':focus').getAttribute('data-mini-next'), '');
    await act('mini-undo').click(); assert.equal(await page.locator('[data-mini-next]').count(), 0);
    await act('mini-restart').click(); await page.locator('[data-mini-marks]').uncheck();
    await solve('rook-flag'); assert.equal((await progress()).minigames['rook-flag'], 'independent');
    assert.deepEqual((await progress()).lessons, ['board']);
    assert.equal((await progress()).exercises['rook-0'], 'independent');
    console.log('✓ Small-board keyboard, goals, invalid moves, undo and old progress migration');
    for (const challenge of M.catalog) {
      await go('minigame/' + challenge.id);
      if (await page.locator('[data-mini-next]').count()) await act('mini-restart').click();
      assert.equal(await page.locator('[role="gridcell"]').count(), challenge.size ** 2);
      await solve(challenge.id);
      await page.locator('[data-mini-next]').waitFor();
    }
    assert.equal(Object.keys((await progress()).minigames).length, 12);
    console.log('✓ All 12 mini-games, captures, sequential flags and king protection');
    await go('minigame/bishop-path');
    await act('mini-restart').click();
    // Take a legal detour. The hint must adapt to the resulting position.
    await square('a1').click(); await square('b2').click();
    await act('mini-lesson').click(); await page.locator('.lesson-instruction').waitFor();
    await page.locator('a[href="#minigame/bishop-path"]').click(); await page.locator('.mini-layout').waitFor();
    assert.ok(await square('b2').locator('svg').count());
    await act('mini-hint').click();
    const detour = M.play(M.start('bishop-path'), C.index('a1'), C.index('b2'));
    const hint = M.solution(detour)[0];
    assert.equal(await square(hint.from).getAttribute('aria-selected'), 'true');
    assert.ok((await square(hint.to).getAttribute('class')).includes('destination'));
    await square(hint.to).click();
    await act('mini-restart').click();
    await page.locator('.list-controls summary').click();
    for (const move of M.solution(M.start('bishop-path'))) {
      await page.locator('[data-list-from]').selectOption(String(move.from));
      await page.locator('[data-list-to]').selectOption(String(move.to));
      await act('list-move').click();
      if (!(await page.locator('[data-mini-next]').count())) assert.notEqual(await page.locator('.list-controls').getAttribute('open'), null);
    }
    await page.locator('[data-mini-next]').waitFor();
    console.log('✓ Hints after detours, lesson return and large list controls');
    const captures = process.env.ENROCA_SCREENSHOTS;
    if (captures) fs.mkdirSync(captures, { recursive: true });
    for (const lang of ['es', 'en']) {
      await go('settings');
      await page.locator('[data-setting="lang"]').selectOption(lang);
      await page.locator('[data-setting="size"]').selectOption('large');
      await page.locator('[data-setting="contrast"]').check();
      await page.locator('[data-setting="names"]').check();
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 960 });
        for (const hash of ['minigames', 'minigame/rook-flag', 'minigame/pawn-capture', 'minigame/choose-safety']) {
          await go(hash);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, lang + '/' + width + '/' + hash);
          const text = await page.locator('main').innerText();
          assert.equal(/\bmini\.[a-z]|undefined|NaN/.test(text), false, 'all visible strings translated');
        }
      }
    }
    if (captures) {
      await go('settings'); await page.locator('[data-setting="lang"]').selectOption('es');
      await page.locator('[data-setting="size"]').selectOption('regular');
      await page.locator('[data-setting="contrast"]').uncheck(); await page.locator('[data-setting="names"]').uncheck();
      await page.setViewportSize({ width: 1280, height: 960 }); await go('minigames');
      await page.screenshot({ path: path.join(captures, 'minigames-desktop.png'), fullPage: true });
      await go('minigame/rook-path'); await square('a1').click();
      await page.screenshot({ path: path.join(captures, 'minigame-desktop.png'), fullPage: true });
      await page.setViewportSize({ width: 375, height: 900 }); await go('minigame/knight-flag');
      await page.screenshot({ path: path.join(captures, 'minigame-mobile.png'), fullPage: true });
    }
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true);
    await context.setOffline(true); await go('minigame/rook-shield'); await solve('rook-shield');
    await page.locator('[data-mini-next]').waitFor(); await context.setOffline(false);
    await go('settings'); await act('delete-data').click(); await page.locator('#confirm-action').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('enroca:progress')), null);
    await go('minigames'); assert.equal(await page.locator('.lesson-state').filter({ hasText: /✓/ }).count(), 0);
    await go('minigame/not-a-challenge'); assert.equal(await page.locator('.mini-group').count(), 3);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    console.log('✓ Responsive ES/EN, text/contrast/names, offline mini-game, reset and invalid route');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
