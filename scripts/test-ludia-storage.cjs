'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const G=require('../games/shared.js');for(const id of ['tic-tac-toe','connect-four','battleship','sudoku','tetris','domino','checkers'])require('../games/'+id+'.js');
const url=process.env.ENROCA_TEST_URL||'http://127.0.0.1:8099/';
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({locale:'es-ES'}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(url).origin)external.push(r.url());});
 const go=async hash=>{await page.goto(url+'#'+hash);await page.locator('main h1').waitFor();};
 try{
  await go('home');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const files=fs.readFileSync(path.resolve(__dirname,'../sw.js'),'utf8').match(/var ARCHIVOS = \[([\s\S]*?)\];/)[1];const expected=JSON.parse('['+files+']');
  const cached=await page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('enroca-v7:'));return(await(await caches.open(name)).keys()).map(r=>new URL(r.url).pathname);});
  for(const asset of expected)assert.ok(cached.includes(new URL(asset,url).pathname),'Uncached '+asset);
  await context.setOffline(true);await go('home');assert.equal(await page.locator('.game-card').count(),8);
  for(const g of G.catalog){await go('ludia/'+g.id+'/rules/0');await page.locator('[data-ludia="next-rule"]').click();await go('ludia/'+g.id+'/play');await page.locator('#ludia-setup button[type=submit]').click();await page.locator('.match-layout').waitFor();assert.ok(await page.locator('.match-board').innerText());}
  await go('learn');assert.equal(await page.locator('.lesson-card').count(),14);
  console.log('✓ Complete precache; all eight games open and play offline');
  await context.setOffline(false);
  const valid={};for(const g of G.catalog){const options={partner:'local',pace:'manual'},seed=123,s=g.init(options,seed),action=g.actions(s)[0];valid[g.id]={version:1,seed,options,actions:action?[action]:[]};}
  await page.evaluate(valid=>{localStorage.setItem('enroca:ludia-sessions',JSON.stringify(valid));localStorage.setItem('another-app:keep','yes');localStorage.setItem('enroca:progress',JSON.stringify({lessons:['board'],exercises:{'board-a1':'independent'},minigames:{}}));},valid);
  await page.reload();
  for(const g of G.catalog){await go('ludia/'+g.id+'/match');await page.locator('.match-layout').waitFor();const actual=await page.evaluate(()=>Ludia.api.active.states.at(-1));const raw=valid[g.id];let expected=g.init(raw.options,raw.seed);for(const a of raw.actions)expected=g.move(expected,a);assert.deepEqual(actual,expected,g.id+' restores through legal replay');}
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('enroca:progress')).exercises['board-a1']),'independent');
  console.log('✓ Every save slot replays deterministically; chess progress is preserved');
  await go('settings');await page.locator('[data-action="delete-data"]').click();await page.locator('[data-action="close-dialog"]').click();assert.ok(await page.evaluate(()=>localStorage.getItem('enroca:ludia-sessions')));await page.locator('[data-action="delete-data"]').click();await page.locator('#confirm-action').click();assert.equal(await page.evaluate(()=>localStorage.getItem('enroca:ludia-sessions')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('enroca:progress')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('another-app:keep')),'yes');
  await page.evaluate(()=>localStorage.setItem('enroca:ludia-sessions',JSON.stringify({'tic-tac-toe':{version:1,seed:3,options:{},actions:[{at:200}]},sudoku:{version:1,seed:3,options:{},actions:'wrong'}})));
  await page.reload();
  for(const id of ['tic-tac-toe','sudoku']){await go('ludia/'+id+'/play');assert.equal(await page.locator('a[href="#ludia/'+id+'/match"]').count(),0);}
  console.log('✓ Cancelled/confirmed scoped reset and invalid histories');
  const blocked=await browser.newContext({locale:'es-ES'});await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));const bp=await blocked.newPage();await bp.goto(url+'#ludia/tic-tac-toe/play');await bp.locator('#ludia-setup button[type=submit]').click();await bp.locator('[data-cell="4"]').click();assert.equal(await bp.locator('#storage-notice').isVisible(),true);await blocked.close();
  const direct=await browser.newPage();await direct.goto('file:///'+path.resolve(__dirname,'../index.html').replace(/\\/g,'/'));assert.equal(await direct.locator('.game-card').count(),8);await direct.locator('a[href="#ludia/sudoku"]').click();await direct.locator('a[href="#ludia/sudoku/play"]').click();await direct.locator('#ludia-setup button[type=submit]').click();await direct.locator('.board-sudoku').waitFor();
  console.log('✓ Blocked storage and direct-file play');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
