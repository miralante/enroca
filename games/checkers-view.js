(function(){
  'use strict';
  const g=window.LudiaGames.get('checkers');let show=true;
  Object.assign(window.LudiaCopy,{
    startingPieces:['Piezas al empezar','Starting pieces'],fewCheckers:['Pocas fichas · 3 por persona','A few pieces · 3 each'],fullCheckers:['Todas las fichas · 12 por persona','All pieces · 12 each'],checkersVariant:['Damas inglesas · 8 × 8','English checkers · 8 × 8'],lightPiece:['ficha clara','light piece'],darkPiece:['ficha oscura','dark piece'],lightKing:['dama clara','light king'],darkKing:['dama oscura','dark king'],destination:['destino posible','possible destination'],selectedPiece:['seleccionada','selected'],captureRequired:['Hay una captura. Debes hacer un salto.','A capture is available. You must jump.'],continueJump:['Sigue saltando con la misma ficha.','Keep jumping with the same piece.'],selectChecker:['Elige una ficha y después su destino.','Choose a piece, then its destination.'],checkerHint:['Mueve de {from} a {to}.','Move from {from} to {to}.'],moveWithLists:['Mover con listas','Move with lists'],from:['Desde','From'],to:['Hasta','To'],movePiece:['Mover ficha','Move piece'],chooseFrom:['Elige una ficha','Choose a piece'],chooseTo:['Elige un destino','Choose a destination'],checkersCount:['Fichas: {n} claras y {m} oscuras','Pieces: {n} light and {m} dark'],kingMark:['La corona marca una dama.','The crown marks a king.']
  });
  const coord=at=>'abcdefgh'[at%8]+(8-Math.floor(at/8));
  const pieceKey=p=>({1:'lightPiece',2:'lightKing',3:'darkPiece',4:'darkKing'}[p]);
  window.LudiaOptions.checkers=({t,esc})=>`<p class="variant-note">${esc(t('checkersVariant'))}</p><label>${esc(t('startingPieces'))}<select name="setup"><option value="few">${esc(t('fewCheckers'))}</option><option value="full">${esc(t('fullCheckers'))}</option></select></label>`;
  window.LudiaViews.checkers=(s,interactive,api)=>{
    const {grid,t,esc,button}=api,legal=g.actions(s),from=s.forced!==null?s.forced:api.selected,targets=from!==null?legal.filter(m=>m.from===from).map(m=>m.to):[],sources=[...new Set(legal.map(m=>m.from))];
    return `<div class="checkers-wrap">${grid(g,s,8,8,interactive,(at,r,c)=>({html:`${s.board[at]?`<span class="checker checker-${g.owner(s.board[at])}" aria-hidden="true">${g.isKing(s.board[at])?'♛':g.owner(s.board[at])===1?'●':'○'}</span>`:''}<small class="checker-coordinate">${coord(at)}</small>${show&&targets.includes(at)?'<i class="move-dot" aria-hidden="true"></i>':''}`,label:coord(at)+', '+(s.board[at]?t(pieceKey(s.board[at])):t('empty'))+(from===at?', '+t('selectedPiece'):'')+(show&&targets.includes(at)?', '+t('destination'):''),cls:`${(r+c)%2?'checker-dark':'checker-light'} ${from===at?'checker-selected':''} ${api.hintAction?.to===at?'hinted':''}`}))}${interactive?`<p class="checker-direction">↑ ${esc(t('lightPiece'))} · ↓ ${esc(t('darkPiece'))}</p><div class="actions">${button(t('showMoves'),'show-moves','secondary',`aria-pressed="${show}"`)}</div><details class="checker-list"><summary>${esc(t('moveWithLists'))}</summary><label>${esc(t('from'))}<select class="large-select" data-checker-from><option value="">${esc(t('chooseFrom'))}</option>${sources.map(at=>`<option value="${at}" ${from===at?'selected':''}>${coord(at)} · ${esc(t(pieceKey(s.board[at])))}</option>`).join('')}</select></label><label>${esc(t('to'))}<select class="large-select" data-checker-to><option value="">${esc(t('chooseTo'))}</option>${targets.map(at=>`<option value="${at}">${coord(at)}</option>`).join('')}</select></label>${button(t('movePiece'),'checker-list-move','secondary')}</details>`:''}</div>`;
  };
  window.LudiaStatus.checkers=(s,api)=>g.status(s).ended?api.statusText(g,s):api.isComputer(s)?api.t('thinking'):s.forced!==null?api.t('continueJump'):api.statusText(g,s);
  window.LudiaPanels.checkers=(s,{t,esc})=>`<p>${esc(t(g.actions(s).some(a=>a.capture!==undefined)?'captureRequired':'selectChecker'))}</p><p class="stat-note">${esc(t('checkersCount',{n:s.board.filter(p=>g.owner(p)===1).length,m:s.board.filter(p=>g.owner(p)===2).length}))}</p><p class="save-note">${esc(t('checkersVariant'))}. ${esc(t('kingMark'))}</p>`;
  window.LudiaCell.checkers=(at,s,api)=>{
    const from=s.forced!==null?s.forced:api.selected;
    if(g.owner(s.board[at])===s.turn){api.selected=at===api.selected?null:at;api.renderLocal(`[data-cell="${at}"]`);return null;}
    if(from!==null)return {from,to:at};api.message=api.t('selectChecker');api.renderLocal(`[data-cell="${at}"]`);api.ctx.announce(api.message);return null;
  };
  window.LudiaAction.checkers=(action,_control,s,api,course)=>{
    if(action==='show-moves'){show=!show;api.renderLocal();return;}
    if(action==='checker-list-move'){const from=document.querySelector('[data-checker-from]').value,to=document.querySelector('[data-checker-to]').value;if(from!==''&&to!==''){const a={from:Number(from),to:Number(to)};course?api.tryExercise(a):api.commit(a);}}
  };
  window.LudiaHint.checkers=(s,a,api)=>{api.selected=a.from;show=true;return api.t('checkerHint',{from:coord(a.from),to:coord(a.to)});};
  document.addEventListener('change',event=>{if(!event.target.matches('[data-checker-from]'))return;window.Ludia.api.selected=event.target.value===''?null:Number(event.target.value);window.Ludia.api.renderLocal();const details=document.querySelector('.checker-list');if(details){details.open=true;details.querySelector('[data-checker-to]').focus();}});
}());
