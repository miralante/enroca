'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const G=require('../games/shared.js');
for(const file of ['tic-tac-toe','connect-four','battleship','sudoku','tetris','domino','checkers'])require('../games/'+file+'.js');
for(const file of ['curriculum','sudoku-content','tetris-content','domino-content','checkers-content'])require('../games/'+file+'.js');
const url=process.env.ENROCA_TEST_URL||'http://127.0.0.1:8099/';
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1365,height:1000},locale:'es-ES'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const go=async hash=>{await page.goto(url+'#'+hash,{waitUntil:'domcontentloaded'});await page.locator('main h1').waitFor();};
 const act=name=>page.locator('[data-ludia="'+name+'"]');
 const cell=at=>page.locator('[data-cell="'+at+'"]');
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('enroca:ludia-sessions')));
 const state=async()=>{await page.waitForFunction(()=>window.Ludia?.api.active);return page.evaluate(()=>Ludia.api.active.states.at(-1));};
 const courseAction=async(g,a)=>{
  if(g.id==='tic-tac-toe'||g.id==='battleship'){
   if(g.id==='battleship'&&a.type==='place'&&a.at===0){await page.locator('.coordinate-picker summary').click();await act('sea-coordinate').click();}
   else await cell(a.at).click();
  }
  if(g.id==='connect-four')await page.locator('[data-col="'+a.col+'"]').click();
  if(g.id==='sudoku'){if(a.type==='note')await act('notes').click();await cell(a.at).click();await page.locator('[data-ludia="shape"][data-value="'+a.value+'"]').click();}
  if(g.id==='tetris')await act('t-'+a.type).click();
  if(g.id==='domino'){if(a.type==='play'){await page.locator('[data-tile="'+a.id+'"]').click();await act('place-'+a.end).click();}else await act(a.type==='draw'?'draw-tile':'pass-turn').click();}
  if(g.id==='checkers'){await cell(a.from).click();await cell(a.to).click();}
 };
 async function start(id,options={}){await go('ludia/'+id+'/play');for(const [k,v]of Object.entries(options))await page.locator('#ludia-setup [name="'+k+'"]').selectOption(String(v));await page.locator('#ludia-setup button[type=submit]').click();if(await page.locator('#dialog').isVisible())await page.locator('#confirm-action').click();await page.waitForURL('**/#ludia/'+id+'/match');await page.locator('.match-layout').waitFor();}
 try{
  await go('home');assert.equal(await page.locator('.game-card').count(),8);
  if(!process.env.LUDIA_SKIP_COURSES) for(const g of G.catalog){
   await go('ludia/'+g.id);assert.equal(await page.locator('.phase-card').count(),3);
   for(let step=0;step<g.lessons.length;step++){
    const lesson=g.lessons[step];await go('ludia/'+g.id+'/rules/'+step);assert.equal(await page.locator('.course-instruction').innerText(),lesson.body[0]);
    if(lesson.kind==='board'){await act('demo').click();assert.equal(await act('demo').innerText(),'Ver el inicio');}
    await act('next-rule').click();
    await go('ludia/'+g.id+'/exercises/'+step);
    if(lesson.kind==='choice'){const wrong=(lesson.answer+1)%lesson.options.length;await page.locator('[data-answer-index="'+wrong+'"]').click();assert.equal(await page.locator('.course-feedback.is-success').count(),0);await page.locator('[data-answer-index="'+lesson.answer+'"]').click();}
    else await courseAction(g,lesson.solution);
    await page.locator('.course-feedback.is-success').waitFor();
    assert.equal(await page.locator('.course-feedback').innerText(),'¡Eso es!');
    await page.locator('a.button[href="#ludia/'+g.id+'/exercises/'+(step+1)+'"]').click();
   }
   await page.locator('.ludia-complete').waitFor();
   const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('enroca:ludia-progress')));
   assert.equal(progress[g.id].rules.length,g.lessons.length);assert.equal(progress[g.id].exercises.length,g.lessons.length);
   console.log('✓ '+g.id+': every rule, example and exercise completed');
  }
  if(!process.env.LUDIA_ONLY_LAYOUT){
  await start('tic-tac-toe',{partner:'local'});for(const at of [0,3,1,4,2])await cell(at).click();assert.equal(G.get('tic-tac-toe').status(await state()).winner,1);await act('undo').click();assert.equal(G.get('tic-tac-toe').status(await state()).ended,false);await cell(2).click();await page.reload();assert.equal((await stored())['tic-tac-toe'].actions.length,5);
  await start('connect-four',{partner:'local'});await page.locator('.coordinate-picker summary').click();await page.locator('[data-four-column]').selectOption({value:'0'});await act('column-list').click();for(const col of [6,1,6,2,5,3])await page.locator('[data-col="'+col+'"]').click();assert.equal(G.get('connect-four').status(await state()).winner,1);
  console.log('✓ Connection games: full wins, undo and reload');
  await start('battleship');await act('auto-place').click();await act('start-battle').click();await cell(0).click();await page.waitForFunction(()=>Ludia.api.active.actions.length===4);await act('undo').click();assert.equal((await state()).shots[0].length,0);assert.equal((await state()).shots[1].length,0);
  // Complete the real game by firing through the visible UI at known fixture positions.
  const targets=(await state()).ships[1].flat();for(const at of targets){await cell(at).click();await page.waitForFunction(()=>Ludia.api.active.states.at(-1).turn===1||LudiaGames.get('battleship').status(Ludia.api.active.states.at(-1)).ended);if(G.get('battleship').status(await state()).ended)break;}
  assert.equal(G.get('battleship').status(await state()).ended,true);
  console.log('✓ Battleship: deployment, full battle and pair undo');
  await start('sudoku',{size:6});const puzzle=await state();for(let at=0;at<puzzle.board.length;at++)if(!puzzle.givens[at]){await cell(at).click();await page.locator('[data-ludia="shape"][data-value="'+puzzle.solution[at]+'"]').click();}assert.equal(G.get('sudoku').status(await state()).solved,true);await act('undo').click();assert.equal(G.get('sudoku').status(await state()).ended,false);await page.reload();assert.equal(G.get('sudoku').status(await state()).ended,false);
  console.log('✓ Visual sudoku: complete six-shape puzzle, undo and resume');
  await start('tetris',{pace:'manual',goal:0});const initial=(await state()).piece.y;await page.waitForTimeout(1600);assert.equal((await state()).piece.y,initial);await act('t-rotate').click();await act('t-hold').click();await act('t-drop').click();assert.equal((await state()).placed,1);await act('undo').click();assert.equal((await state()).placed,0);
  await start('tetris',{pace:'steady'});assert.equal(await act('pause').innerText(),'Continuar caída');await act('pause').click();await page.waitForTimeout(850);await act('pause').click();const paused=(await state()).piece.y;await page.waitForTimeout(850);assert.equal((await state()).piece.y,paused);assert.ok(paused>0);await go('home');await go('ludia/tetris/match');assert.equal(await act('pause').innerText(),'Continuar caída');
  console.log('✓ Tetris: manual controls, hold, undo, automatic falling and pause');
  await start('domino',{partner:'local'});assert.equal(await page.locator('.hand-tile').count(),0);await act('reveal-hand').click();let moves=0;while(!G.get('domino').status(await state()).ended&&moves<110){if(await act('reveal-hand').count())await act('reveal-hand').click();const a=G.get('domino').hint(await state());await courseAction(G.get('domino'),a);moves++;}assert.equal(G.get('domino').status(await state()).ended,true);
  console.log('✓ Domino: private handover and complete two-person match');
  await start('checkers',{partner:'local',setup:'few'});await cell(42).click();await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>document.activeElement.dataset.cell),'34');await cell(33).click();assert.equal((await state()).turn,2);await act('undo').click();assert.equal((await state()).turn,1);await page.locator('.checker-list summary').click();await page.locator('[data-checker-from]').selectOption('42');await page.locator('[data-checker-to]').selectOption('33');await act('checker-list-move').click();assert.equal((await state()).turn,2);
  moves=0;while(!G.get('checkers').status(await state()).ended&&moves<160){const a=G.get('checkers').hint(await state());await courseAction(G.get('checkers'),a);moves++;}assert.equal(G.get('checkers').status(await state()).ended,true);
  console.log('✓ Checkers: keyboard, alternative lists, undo and full match');
  }
  assert.deepEqual(errors,[]);
  // Render active matches, including their controls, during the layout matrix.
  const fresh={};for(const g of G.catalog)fresh[g.id]={version:1,seed:17,options:{partner:'computer',size:6,setup:'full',pace:'manual'},actions:g.id==='battleship'?[{type:'auto'},{type:'start'}]:[]};
  await page.evaluate(fresh=>localStorage.setItem('enroca:ludia-sessions',JSON.stringify(fresh)),fresh);
  await page.reload();
  for(const lang of ['es','en']){
   await go('settings');await page.locator('[data-setting="lang"]').selectOption(lang);await page.locator('[data-setting="size"]').selectOption('large');await page.locator('[data-setting="contrast"]').check();
   for(const width of [320,375,768,1365]){await page.setViewportSize({width,height:900});for(const hash of ['home',...G.catalog.flatMap(g=>['ludia/'+g.id,'ludia/'+g.id+'/rules/0','ludia/'+g.id+'/exercises/'+g.lessons.findIndex(l=>l.kind==='board'),'ludia/'+g.id+'/play','ludia/'+g.id+'/match'])]){await page.goto(url+'?lang='+lang+'#'+hash);await page.locator('main h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,lang+' '+width+' '+hash+' overflow');assert.equal(await page.locator('html').getAttribute('lang'),lang);}}
  }
  console.log('✓ All games in ES/EN, large text and contrast at 320/375/768/1365px');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
