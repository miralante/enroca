'use strict';
const assert = require('node:assert/strict');
const G = require('../games/shared.js');
const tic = require('../games/tic-tac-toe.js');
let count = 0;
function check(value, message) { assert.ok(value, message); count++; }
function play(g, s, actions) { for (const a of actions) { const n = g.move(s, a); check(n, g.id + ': legal action ' + JSON.stringify(a)); s = n; } return s; }
let s = tic.init(); s = play(tic, s, [0, 3, 1, 4, 2].map(at => ({ at })));
check(tic.status(s).winner === 1, 'Three in a row wins');
check(!tic.move(s, { at: 8 }), 'No moves after victory');
check(!tic.move(tic.init(), { at: -1 }), 'Bounds checked');
const block = { board: [2, 2, 0, 1, 0, 0, 1, 0, 0], turn: 1 };
check(tic.hint(block).at === 2, 'Opponent blocks a loss');
function neverLoses(s) {
  const end = tic.status(s); if (end.ended) { check(end.winner !== 1, 'Computer cannot lose at full strength'); return; }
  if (s.turn === 2) neverLoses(tic.move(s, tic.hint(s)));
  else for (const a of tic.actions(s)) neverLoses(tic.move(s, a));
}
neverLoses(tic.init());
const four=require('../games/connect-four.js'),sea=require('../games/battleship.js'),sudoku=require('../games/sudoku.js');
s=play(four,four.init(),[0,6,1,6,2,5,3].map(col=>({col})));check(four.status(s).winner===1,'Four horizontally wins');
s=play(four,four.init(),[0,1,0,1,0,2].map(col=>({col})));check(four.hint(s).col===0,'Four AI finishes a vertical win');
s=play(four,four.init(),[0,0,0,0,0,0].map(col=>({col})));check(!four.move(s,{col:0}),'Full column rejected');
for(const size of [6,8])for(let seed=0;seed<12;seed++){
  s=sea.init({size},seed);check(!sea.move(s,{type:'start'}),'Cannot start without a fleet');
  s=sea.move(s,{type:'auto'});for(const ships of s.ships){check(new Set(ships.flat()).size===s.fleet.reduce((a,b)=>a+b),'Ships do not overlap');check(ships.flat().every(at=>at>=0&&at<size*size),'Ships in bounds');}
  s=sea.move(s,{type:'start'});let moves=0;while(!sea.status(s).ended&&moves<2*size*size){s=sea.move(s,sea.hint(s));check(s,'Battleship hint is a legal shot');moves++;}check(sea.status(s).ended,'A fleet is sunk and the match ends');
}
const placement=sea.init({},12);check(!sea.move(placement,{type:'place',at:5,vertical:false}),'No wrapping ships');s=sea.move(placement,{type:'place',at:0,vertical:false});check(!sea.move(s,{type:'place',at:1,vertical:true}),'No overlapping placement');
for(const size of [4,6])for(let seed=1;seed<=20;seed++){
  s=sudoku.init({size,difficulty:seed%2?'gentle':'challenge'},seed);check(sudoku.solve(s.board,size).count===1,'Generated puzzle has one solution');
  const fixed=s.givens.findIndex(Boolean);check(!sudoku.move(s,{type:'set',at:fixed,value:0}),'Clues cannot be erased');
  while(!sudoku.status(s).ended){const action=sudoku.hint(s);check(action,'Unfinished puzzle has a hint');s=sudoku.move(s,action);check(s,'Sudoku hint is legal');}check(sudoku.conflicts(s).length===0,'Completed sudoku respects every unit');
}
const tetris=require('../games/tetris.js'),domino=require('../games/domino.js'),checkers=require('../games/checkers.js');
for(let seed=1;seed<=12;seed++){
  s=tetris.init({goal:0},seed);check(new Set([s.piece.type,...s.queue.slice(0,6)]).size===7,'Tetris bag contains all seven pieces');
  const held=tetris.move(s,{type:'hold'});check(held.hold===s.piece.type&&!tetris.move(held,{type:'hold'}),'Hold limited to once per placement');
  check(tetris.move(held,{type:'drop'}).held===false,'Placement unlocks hold');
}
s=tetris.init({goal:5},9);s.piece={type:'I',x:3,y:0,rotation:0};s.board.splice(190,10,1,1,1,0,0,0,0,1,1,1);s=tetris.move(s,{type:'drop'});check(s.lines===1&&s.lastClear===1,'A complete Tetris row clears');
s=tetris.init({goal:5},9);s.piece={type:'I',x:1,y:0,rotation:1};for(let row=16;row<20;row++)for(let col=0;col<10;col++)s.board[row*10+col]=col===3?0:1;s.lines=1;s=tetris.move(s,{type:'drop'});check(s.lines===5&&tetris.status(s).solved,'Four simultaneous rows and target victory');check(!tetris.move(s,{type:'left'}),'No moves after Tetris target');
s=tetris.init({goal:0},5);let placed=0;while(!tetris.status(s).ended&&placed<50){s=tetris.move(s,{type:'drop'});placed++;}check(tetris.status(s).over,'Top-out ends a Tetris game');
s=tetris.init({goal:0},3);const before=JSON.stringify(s),plan=tetris.plan(s);check(plan.length>0,'Tetris has a legal hint plan');s=play(tetris,s,plan);check(s.placed===1,'Tetris hint can place a piece');check(JSON.stringify(tetris.init({goal:0},3))===before,'Tetris transitions preserve input');
for(let seed=1;seed<=30;seed++){
  s=domino.init({},seed);check(new Set([...s.hands.flat(),...s.stock]).size===28,'Double-six set contains 28 distinct tiles');let moves=0;
  while(!domino.status(s).ended&&moves<120){s=domino.move(s,domino.hint(s));check(s,'Domino hint is legal');for(let i=1;i<s.chain.length;i++)check(s.chain[i-1].right===s.chain[i].left,'Domino endpoints match');moves++;}check(domino.status(s).ended,'Domino match terminates');check(s.hands.flat().length+s.stock.length+s.chain.length===28,'Domino never loses or duplicates a tile');
}
check(checkers.init().board.filter(Boolean).length===24,'Checkers full setup has 24 pieces');check(checkers.init({setup:'few'}).board.filter(Boolean).length===6,'Checkers reduced setup has 6 pieces');
function draughts(pieces,turn=1){const s={board:Array(64).fill(0),turn,forced:null,quiet:0,history:[],last:null};for(const [at,p]of pieces)s.board[at]=p;s.history=[checkers.key(s)];return s;}
s=draughts([[42,1],[46,1],[35,3],[21,3],[1,3]]);check(!checkers.move(s,{from:46,to:37}),'Mandatory capture rejects another regular move');s=checkers.move(s,{from:42,to:28});check(s.turn===1&&s.forced===28,'First capture retains turn');check(!checkers.move(s,{from:46,to:37}),'Must continue with same piece');s=checkers.move(s,{from:28,to:14});check(s.turn===2&&s.forced===null,'Final jump ends turn');
s=draughts([[17,1],[10,3],[12,3]]);s=checkers.move(s,{from:17,to:3});check(s.board[3]===2&&s.turn===2&&s.forced===null,'Crowning ends the capture turn');
s=draughts([[28,2],[35,3],[1,3]]);check(checkers.move(s,{from:28,to:42}),'A king captures backwards');s=draughts([[28,1],[35,3],[1,3]]);check(!checkers.move(s,{from:28,to:42}),'Regular piece cannot capture backwards');
s=draughts([[42,1],[35,3]]);s=checkers.move(s,{from:42,to:28});check(checkers.status(s).winner===1,'Last capture wins');
s=draughts([[56,2],[7,4]]);s.quiet=80;check(checkers.status(s).ended&&checkers.status(s).winner===0,'80 quiet plies draw');s.quiet=0;s.history=[checkers.key(s),checkers.key(s),checkers.key(s)];check(checkers.status(s).ended,'Threefold position draws');
for(let seed=1;seed<=6;seed++){s=checkers.init({setup:'few'});let moves=0,rng=G.random(seed);while(!checkers.status(s).ended&&moves<350){const legal=checkers.actions(s);s=checkers.move(s,legal[Math.floor(rng()*legal.length)]);check(s,'Every generated checkers move is accepted');moves++;}check(checkers.status(s).ended,'Reduced checkers match terminates');}
require('../games/curriculum.js');require('../games/sudoku-content.js');require('../games/tetris-content.js');require('../games/domino-content.js');require('../games/checkers-content.js');
for(const g of G.catalog){check(g.lessons.length>=8,g.id+' has a complete curriculum');for(const l of g.lessons){for(const key of ['title','body','prompt','hint'])check(Array.isArray(l[key])&&l[key].length===2&&l[key].every(Boolean),g.id+'/'+l.id+' bilingual '+key);if(l.kind==='board'){const next=g.move(l.setup,l.solution);check(next&&l.accept(l.solution,next,l.setup),g.id+'/'+l.id+' demonstrable solution');}else check(l.options[l.answer],g.id+'/'+l.id+' valid answer');}}
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const sandbox={window:{LudiaGames:G,addEventListener(){}},document:{addEventListener(){}},location:{hash:''}};
for(const file of ['ui-strings','views','sudoku-view','tetris-view','domino-view','checkers-view'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../games/'+file+'.js'),'utf8'),sandbox);
const dictionary=sandbox.window.LudiaCopy;
for(const [key,pair]of Object.entries(dictionary)){check(Array.isArray(pair)&&pair.length===2&&pair.every(v=>typeof v==='string'&&v.length),'Bilingual UI key '+key);const markers=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join();check(markers(pair[0])===markers(pair[1]),'UI placeholder parity '+key);}
for(const file of ['ludia.js',...['views','sudoku-view','tetris-view','domino-view','checkers-view'].map(f=>'games/'+f+'.js')]){const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');for(const match of source.matchAll(/\bt\(['"]([\w-]+)['"]\s*[,)]/g))check(dictionary[match[1]],'Known UI copy '+file+': '+match[1]);}
console.log('Ludia: ' + count + ' engine, curriculum and translation checks passed.');
