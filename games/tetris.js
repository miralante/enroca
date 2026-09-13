(function(root){
  'use strict';
  const G=typeof module==='object'&&module.exports?require('./shared.js'):root.LudiaGames;
  const SHAPES={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
  const TYPES=Object.keys(SHAPES);
  function matrix(piece){let m=SHAPES[piece.type].map(row=>row.slice());for(let i=0;i<piece.rotation;i++)m=m.map((row,y)=>row.map((_,x)=>m[m.length-1-x][y]));return m;}
  function cells(piece){return matrix(piece).flatMap((row,y)=>row.flatMap((v,x)=>v?[{x:x+piece.x,y:y+piece.y}]:[]));}
  function fits(s,piece){return cells(piece).every(({x,y})=>x>=0&&x<10&&y>=-4&&y<20&&(y<0||!s.board[y*10+x]));}
  function refill(s){if(s.queue.length<7){s.queue.push(...G.shuffle(TYPES,G.random(s.seed+s.bags*997)));s.bags++;}}
  function spawn(s,type){refill(s);s.piece={type:type||s.queue.shift(),x:3,y:0,rotation:0};refill(s);if(!fits(s,s.piece))s.over=true;}
  function init(options={},seed=1){const goal=[0,5,10].includes(Number(options.goal))?Number(options.goal):5,s={board:Array(200).fill(0),seed,bags:0,queue:[],piece:null,hold:null,held:false,lines:0,score:0,placed:0,goal,over:false,lastClear:0};spawn(s);return s;}
  function status(s){return {ended:s.over||!!(s.goal&&s.lines>=s.goal),winner:0,solved:!!(s.goal&&s.lines>=s.goal),over:s.over};}
  function ghost(s){const p=G.copy(s.piece);while(fits(s,{...p,y:p.y+1}))p.y++;return p;}
  function lock(s){
    const occupied=cells(s.piece);if(occupied.some(p=>p.y<0)){s.over=true;return;}
    for(const {x,y} of occupied)s.board[y*10+x]=TYPES.indexOf(s.piece.type)+1;
    const rows=Array.from({length:20},(_,r)=>s.board.slice(r*10,r*10+10)),kept=rows.filter(row=>!row.every(Boolean));s.lastClear=20-kept.length;
    s.board=[...Array.from({length:s.lastClear},()=>Array(10).fill(0)),...kept].flat();s.score+=[0,100,300,500,800][s.lastClear]*(Math.floor(s.lines/10)+1);s.lines+=s.lastClear;s.placed++;s.held=false;
    if(!(s.goal&&s.lines>=s.goal))spawn(s);
  }
  function move(s,a){
    if(!a||status(s).ended||!['left','right','down','drop','rotate','rotate-back','hold'].includes(a.type))return null;
    const n=G.copy(s);n.lastClear=0;
    if(a.type==='hold'){if(s.held)return null;const previous=s.hold;n.hold=s.piece.type;spawn(n,previous);n.held=true;return n;}
    if(a.type==='drop'){n.piece=ghost(n);lock(n);return n;}
    if(a.type==='rotate'||a.type==='rotate-back'){
      const p={...n.piece,rotation:(n.piece.rotation+(a.type==='rotate'?1:3))%4};
      for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[0,-2]]){const kicked={...p,x:p.x+dx,y:p.y+dy};if(fits(n,kicked)){n.piece=kicked;return n;}}return null;
    }
    const p={...n.piece,x:n.piece.x+(a.type==='left'?-1:a.type==='right'?1:0),y:n.piece.y+(a.type==='down'?1:0)};
    if(fits(n,p)){n.piece=p;return n;}if(a.type==='down'){lock(n);return n;}return null;
  }
  function actions(s){return status(s).ended?[]:['left','right','rotate','down','drop','hold'].map(type=>({type})).filter(a=>move(s,a));}
  function evaluate(s){const heights=Array.from({length:10},(_,c)=>{const r=Array.from({length:20},(_,r)=>s.board[r*10+c]).findIndex(Boolean);return r<0?0:20-r;});let holes=0;for(let c=0;c<10;c++)for(let r=20-heights[c];r<20;r++)if(!s.board[r*10+c])holes++;
    return s.lastClear*80-heights.reduce((a,b)=>a+b,0)*1.6-holes*8-heights.slice(1).reduce((sum,h,i)=>sum+Math.abs(h-heights[i]),0)*2-(s.over?10000:0);
  }
  function plan(s){
    if(status(s).ended)return [];const queue=[{state:s,path:[]}],seen=new Set();let best=null,score=-Infinity;
    while(queue.length){const item=queue.shift(),p=item.state.piece,key=[p.x,p.y,p.rotation].join(':');if(seen.has(key))continue;seen.add(key);
      const landed=move(item.state,{type:'drop'}),value=evaluate(landed);if(value>score){score=value;best=[...item.path,{type:'drop'}];}
      for(const type of ['left','right','rotate']){const next=move(item.state,{type});if(next)queue.push({state:next,path:[...item.path,{type}]});}
    }return best||[];
  }
  const hint=s=>plan(s)[0]||null;
  const game=G.register({id:'tetris',icon:'▦',color:'purple',players:false,init,move,status,actions,hint,plan,matrix,cells,ghost,fits,types:TYPES});
  if(typeof module==='object'&&module.exports)module.exports=game;
}(typeof window==='undefined'?globalThis:window));
