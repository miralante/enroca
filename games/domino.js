(function(root){
  'use strict';
  const G=typeof module==='object'&&module.exports?require('./shared.js'):root.LudiaGames;
  const tiles=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)tiles.push([a,b]);
  function init(options={},seed=1){const bag=G.shuffle(tiles.map((_,id)=>id),G.random(seed));return {hands:[bag.slice(0,7),bag.slice(7,14)],stock:bag.slice(14),chain:[],turn:1,turnNumber:1,passes:0};}
  function pips(hand){return hand.reduce((sum,id)=>sum+tiles[id][0]+tiles[id][1],0);}
  function status(s){for(let side=0;side<2;side++)if(!s.hands[side].length)return {ended:true,winner:side+1,reason:'empty'};if(s.passes>=2){const a=pips(s.hands[0]),b=pips(s.hands[1]);return {ended:true,winner:a===b?0:a<b?1:2,reason:'blocked',pips:[a,b]};}return {ended:false,winner:0};}
  function orient(s,id,end){if(!tiles[id]||!['left','right'].includes(end))return null;const [a,b]=tiles[id];if(!s.chain.length)return [a,b];const value=end==='left'?s.chain[0].left:s.chain.at(-1).right;
    if(end==='left')return b===value?[a,b]:a===value?[b,a]:null;return a===value?[a,b]:b===value?[b,a]:null;
  }
  function placements(s){if(status(s).ended)return [];return s.hands[s.turn-1].flatMap(id=>(s.chain.length?['left','right']:['right']).flatMap(end=>orient(s,id,end)?[{type:'play',id,end}]:[]));}
  function actions(s){if(status(s).ended)return [];const legal=placements(s);return legal.length?legal:[{type:s.stock.length?'draw':'pass'}];}
  function move(s,a){
    if(!a||status(s).ended)return null;const n=G.copy(s),own=s.turn-1;
    if(a.type==='draw'){if(placements(s).length||!s.stock.length)return null;n.hands[own].push(n.stock.shift());return n;}
    if(a.type==='pass'){if(placements(s).length||s.stock.length)return null;n.passes++;n.turn=3-s.turn;n.turnNumber++;return n;}
    if(a.type!=='play'||!Number.isInteger(a.id)||!s.hands[own].includes(a.id))return null;
    const oriented=orient(s,a.id,a.end);if(!oriented)return null;const tile={id:a.id,left:oriented[0],right:oriented[1]};
    if(a.end==='left')n.chain.unshift(tile);else n.chain.push(tile);n.hands[own].splice(n.hands[own].indexOf(a.id),1);n.turn=3-s.turn;n.turnNumber++;n.passes=0;return n;
  }
  function hint(s){const legal=actions(s);return legal.sort((a,b)=>{if(a.type!=='play'||b.type!=='play')return 0;const score=a=>{const [x,y]=tiles[a.id],remaining=s.hands[s.turn-1].filter(id=>id!==a.id);return x+y+(x===y?2:0)+remaining.filter(id=>tiles[id].includes(x)||tiles[id].includes(y)).length;};return score(b)-score(a);})[0]||null;}
  const game=G.register({id:'domino',icon:'⚃',color:'mint',players:true,init,move,status,actions,hint,placements,tiles,pips,orient});
  if(typeof module==='object'&&module.exports)module.exports=game;
}(typeof window==='undefined'?globalThis:window));
