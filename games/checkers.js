/* 8x8 English draughts movement. Ludia uses automatic threefold/80-ply draws. */
(function(root){
  'use strict';
  const G=typeof module==='object'&&module.exports?require('./shared.js'):root.LudiaGames;
  const owner=p=>p>0?(p<=2?1:2):0,isKing=p=>p===2||p===4;
  function key(s){return s.board.join('')+':'+s.turn;}
  function init(options={}){const board=Array(64).fill(0);if(options.setup==='few'){for(const at of [42,44,46])board[at]=1;for(const at of [17,19,21])board[at]=3;}else for(let at=0;at<64;at++){const r=Math.floor(at/8),c=at%8;if((r+c)%2===1){if(r<3)board[at]=3;if(r>4)board[at]=1;}}
    const s={board,turn:1,forced:null,quiet:0,history:[],last:null};s.history=[key(s)];return s;
  }
  function pieceMoves(s,from,captureOnly=false){
    const piece=s.board[from];if(owner(piece)!==s.turn)return [];const row=Math.floor(from/8),col=from%8,dirs=isKing(piece)?[-1,1]:[s.turn===1?-1:1],moves=[];
    for(const dr of dirs)for(const dc of [-1,1]){const r=row+dr,c=col+dc;if(r<0||r>=8||c<0||c>=8)continue;const at=r*8+c;
      if(!s.board[at]&&!captureOnly)moves.push({from,to:at});
      else if(owner(s.board[at])===3-s.turn){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8&&!s.board[rr*8+cc])moves.push({from,to:rr*8+cc,capture:at});}
    }return moves;
  }
  function rawMoves(s){if(s.forced!==null)return pieceMoves(s,s.forced,true).filter(m=>m.capture!==undefined);const all=s.board.flatMap((p,from)=>owner(p)===s.turn?pieceMoves(s,from):[]),captures=all.filter(m=>m.capture!==undefined);return captures.length?captures:all;}
  function status(s){const legal=rawMoves(s);if(!legal.length)return {ended:true,winner:3-s.turn,reason:'blocked'};if(s.forced===null&&(s.quiet>=80||s.history.filter(k=>k===key(s)).length>=3))return {ended:true,winner:0,reason:'draw'};return {ended:false,winner:0};}
  function actions(s){return status(s).ended?[]:rawMoves(s);}
  function apply(s,m){const n=G.copy(s),piece=n.board[m.from];n.board[m.to]=piece;n.board[m.from]=0;if(m.capture!==undefined)n.board[m.capture]=0;
    const promoted=!isKing(piece)&&(s.turn===1?m.to<8:m.to>=56);if(promoted)n.board[m.to]=s.turn===1?2:4;
    n.last={from:m.from,to:m.to};n.quiet=m.capture!==undefined||promoted?0:n.quiet+1;
    if(m.capture!==undefined&&!promoted&&pieceMoves(n,m.to,true).some(a=>a.capture!==undefined)){n.forced=m.to;return n;}
    n.forced=null;n.turn=3-s.turn;n.history.push(key(n));return n;
  }
  function move(s,a){if(!a||status(s).ended)return null;const m=rawMoves(s).find(m=>m.from===a.from&&m.to===a.to);return m?apply(s,m):null;}
  function evaluate(s,side){return s.board.reduce((v,p,at)=>{if(!p)return v;const sign=owner(p)===side?1:-1,row=Math.floor(at/8),col=at%8;return v+sign*(isKing(p)?175:100)+(isKing(p)?0:sign*(owner(p)===1?7-row:row)*4)+(col>1&&col<6?sign*3:0);},0);}
  function search(s,side,depth,alpha,beta){const end=status(s);if(end.ended)return end.winner?(end.winner===side?1:-1)*(10000+depth):0;if(!depth&&s.forced===null)return evaluate(s,side);let best=s.turn===side?-Infinity:Infinity;
    for(const a of rawMoves(s)){const next=apply(s,a),value=search(next,side,Math.max(0,depth-(next.turn!==s.turn?1:0)),alpha,beta);if(s.turn===side){best=Math.max(best,value);alpha=Math.max(alpha,best);}else{best=Math.min(best,value);beta=Math.min(beta,best);}if(beta<=alpha)break;}return best;
  }
  function hint(s){let best=null,score=-Infinity;for(const a of actions(s)){const value=search(apply(s,a),s.turn,3,-Infinity,Infinity);if(value>score){score=value;best=a;}}return best;}
  const game=G.register({id:'checkers',icon:'♛',color:'pink',players:true,init,move,status,actions,hint,owner,isKing,pieceMoves,key});
  if(typeof module==='object'&&module.exports)module.exports=game;
}(typeof window==='undefined'?globalThis:window));
