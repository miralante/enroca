(function(root){
  'use strict';
  const G=typeof module==='object'&&module.exports?require('./shared.js'):root.LudiaGames;
  function cells(size,at,length,vertical){const row=Math.floor(at/size),col=at%size;if(!Number.isInteger(at)||at<0||at>=size*size||(vertical?row:col)+length>size)return null;return Array.from({length},(_,i)=>at+i*(vertical?size:1));}
  function arrange(size,fleet,seed){const rng=G.random(seed),ships=[];for(const length of fleet){const choices=[];for(let at=0;at<size*size;at++)for(const vertical of [false,true]){const positions=cells(size,at,length,vertical);if(positions&&!positions.some(p=>ships.flat().includes(p)))choices.push(positions);}ships.push(choices[Math.floor(rng()*choices.length)]);}return ships;}
  function init(options={},seed=1){const size=Number(options.size)===8?8:6,fleet=size===8?[4,3,2,2]:[3,2,2];return {size,fleet,seed,arrangements:0,ships:[[],arrange(size,fleet,seed)],shots:[[],[]],phase:'placement',turn:1};}
  function sunk(s,side){const shots=s.shots[1-side].map(x=>x.at);return s.ships[side].filter(ship=>ship.every(at=>shots.includes(at)));}
  function status(s){if(s.phase==='placement')return {ended:false,winner:0};for(let side=0;side<2;side++)if(sunk(s,side).length===s.fleet.length)return {ended:true,winner:2-side};return {ended:false,winner:0};}
  function move(s,a){
    if(!a||status(s).ended)return null;const n=G.copy(s);
    if(s.phase==='placement'){
      if(a.type==='auto'){n.arrangements++;n.ships[0]=arrange(s.size,s.fleet,s.seed+n.arrangements*719);return n;}
      if(a.type==='clear'){n.ships[0]=[];return n;}
      if(a.type==='remove'&&n.ships[0].length){n.ships[0].pop();return n;}
      if(a.type==='start'&&s.ships[0].length===s.fleet.length){n.phase='battle';return n;}
      if(a.type!=='place'||s.ships[0].length===s.fleet.length)return null;
      const positions=cells(s.size,a.at,s.fleet[s.ships[0].length],a.vertical===true);
      if(!positions||positions.some(p=>s.ships[0].flat().includes(p)))return null;n.ships[0].push(positions);return n;
    }
    if(a.type!=='fire'||!Number.isInteger(a.at)||a.at<0||a.at>=s.size*s.size||s.shots[s.turn-1].some(x=>x.at===a.at))return null;
    const own=s.turn-1,enemy=1-own,ship=s.ships[enemy].find(ship=>ship.includes(a.at));
    n.shots[own].push({at:a.at,hit:!!ship});n.turn=3-s.turn;return n;
  }
  function actions(s){if(status(s).ended)return [];if(s.phase==='placement')return [{type:'auto'}];return Array.from({length:s.size*s.size},(_,at)=>({type:'fire',at})).filter(a=>!s.shots[s.turn-1].some(x=>x.at===a.at));}
  function hint(s){
    if(s.phase==='placement')return s.ships[0].length===s.fleet.length?{type:'start'}:{type:'auto'};
    const own=s.turn-1,shots=s.shots[own],finished=sunk(s,1-own).flat(),available=actions(s);if(!available.length)return null;
    const liveHits=shots.filter(x=>x.hit&&!finished.includes(x.at)).map(x=>x.at);
    // Only visible hits influence targeting. Unhit enemy ship cells are never inspected.
    const rank=a=>liveHits.reduce((v,h)=>v+(Math.abs(Math.floor(a.at/s.size)-Math.floor(h/s.size))+Math.abs(a.at%s.size-h%s.size)===1?10:0),0)+((Math.floor(a.at/s.size)+a.at%s.size)%2===0?1:0);
    return G.shuffle(available,G.random(s.seed+shots.length*73)).sort((a,b)=>rank(b)-rank(a))[0];
  }
  const game=G.register({id:'battleship',icon:'⌁',color:'aqua',players:false,init,move,status,actions,hint,sunk,cells,arrange});
  if(typeof module==='object'&&module.exports)module.exports=game;
}(typeof window==='undefined'?globalThis:window));
