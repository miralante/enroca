(function(root){
  'use strict';
  const G=typeof module==='object'&&module.exports?require('./shared.js'):root.LudiaGames;
  function peers(size,at){const row=Math.floor(at/size),col=at%size,w=size/2;return Array.from({length:size*size},(_,i)=>i).filter(i=>i!==at&&(Math.floor(i/size)===row||i%size===col||(Math.floor(Math.floor(i/size)/2)===Math.floor(row/2)&&Math.floor((i%size)/w)===Math.floor(col/w))));}
  function candidates(board,size,at){if(board[at])return [];const used=peers(size,at).map(i=>board[i]);return Array.from({length:size},(_,i)=>i+1).filter(v=>!used.includes(v));}
  function conflicts(s){return s.board.flatMap((v,at)=>v&&peers(s.size,at).some(i=>s.board[i]===v)?[at]:[]);}
  function solve(board,size,limit=2){
    let count=0,solution=null;const current=board.slice();
    function visit(){if(count>=limit)return;let at=-1,choices=null;for(let i=0;i<current.length;i++){if(current[i])continue;const possible=candidates(current,size,i);if(!possible.length)return;if(!choices||possible.length<choices.length){at=i;choices=possible;}}
      if(at===-1){count++;solution=current.slice();return;}for(const v of choices){current[at]=v;visit();if(count>=limit)break;}current[at]=0;
    }
    if(!conflicts({board:current,size}).length)visit();return {count,solution};
  }
  function init(options={},seed=1){
    const size=Number(options.size)===6?6:4,rng=G.random(seed),symbols=G.shuffle(Array.from({length:size},(_,i)=>i+1),rng),w=size/2;
    const rows=G.shuffle(Array.from({length:size/2},(_,i)=>i),rng).flatMap(b=>G.shuffle([b*2,b*2+1],rng));
    const cols=G.shuffle([0,1],rng).flatMap(b=>G.shuffle(Array.from({length:w},(_,i)=>b*w+i),rng));
    const solution=rows.flatMap(r=>cols.map(c=>symbols[(r*w+Math.floor(r/2)+c)%size])),board=solution.slice();
    const target=options.difficulty==='challenge'?Math.floor(size*size*.3):Math.floor(size*size*.5);
    for(const at of G.shuffle(Array.from({length:size*size},(_,i)=>i),rng)){if(board.filter(Boolean).length<=target)break;const old=board[at];board[at]=0;if(solve(board,size,2).count!==1)board[at]=old;}
    return {size,board,givens:board.slice(),solution,notes:Array.from({length:size*size},()=>[])};
  }
  function status(s){return {ended:s.board.every(Boolean)&&conflicts(s).length===0,winner:0,solved:s.board.every(Boolean)&&conflicts(s).length===0};}
  function move(s,a){
    if(!a||status(s).ended||!Number.isInteger(a.at)||a.at<0||a.at>=s.size*s.size||s.givens[a.at]||!Number.isInteger(a.value)||a.value<0||a.value>s.size)return null;
    if(!['set','note'].includes(a.type))return null;
    const n=G.copy(s);if(a.type==='note'){if(!a.value||s.board[a.at])return null;const i=n.notes[a.at].indexOf(a.value);if(i<0)n.notes[a.at].push(a.value);else n.notes[a.at].splice(i,1);return n;}
    if(s.board[a.at]===a.value)return null;n.board[a.at]=a.value;n.notes[a.at]=[];return n;
  }
  function actions(s){return status(s).ended?[]:s.board.flatMap((v,at)=>!s.givens[at]&&v!==s.solution[at]?[{type:'set',at,value:s.solution[at]}]:[]);}
  function hint(s){const all=actions(s);return all.find(a=>s.board[a.at]&&s.board[a.at]!==a.value)||all.sort((a,b)=>candidates(s.board,s.size,a.at).length-candidates(s.board,s.size,b.at).length)[0]||null;}
  const game=G.register({id:'sudoku',icon:'▲',color:'yellow',players:false,init,move,status,actions,hint,candidates,conflicts,solve,peers});
  if(typeof module==='object'&&module.exports)module.exports=game;
}(typeof window==='undefined'?globalThis:window));
