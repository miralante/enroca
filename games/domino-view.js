(function(){
  'use strict';
  const G=window.LudiaGames,g=G.get('domino');let revealed='';
  Object.assign(window.LudiaCopy,{
    table:['Mesa','Table'],yourTiles:['Tus fichas','Your tiles'],tilesOf:['Fichas de {name}','{name}’s tiles'],tile:['ficha {a} y {b}','tile {a} and {b}'],leftEnd:['Extremo izquierdo: {n}','Left end: {n}'],rightEnd:['Extremo derecho: {n}','Right end: {n}'],emptyTable:['Pon cualquier ficha para empezar.','Play any tile to start.'],chooseTile:['Elige una ficha. Después elige un extremo.','Choose a tile. Then choose an end.'],placeLeft:['Colocar a la izquierda','Place on the left'],placeRight:['Colocar a la derecha','Place on the right'],drawTile:['Robar ficha','Draw tile'],passTurn:['Pasar turno','Pass turn'],stock:['Fichas en el montón: {n}','Tiles in the stock: {n}'],remainingTiles:['{name}: {n} fichas','{name}: {n} tiles'],handover:['Pasa el dispositivo a {name}.','Pass the device to {name}.'],showHand:['Ver mis fichas','Show my tiles'],handHidden:['Las fichas están ocultas durante el cambio de turno.','Tiles are hidden while players change turns.'],dominoHint:['Elige {a} | {b} y colócala a la {end}.','Choose {a} | {b} and place it on the {end}.'],endLeft:['izquierda','left'],endRight:['derecha','right'],blocked:['La mesa está bloqueada.','The table is blocked.'],remainingPips:['{name}: {n} puntos en la mano','{name}: {n} dots in hand'],noTile:['Elige primero una ficha de tu mano.','First choose a tile from your hand.']
  });
  const dots=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
  function tile(a,b){return `<span class="domino-tile" aria-hidden="true">${[a,b].map(v=>`<span class="domino-half">${Array.from({length:9},(_,i)=>`<i class="${dots[v].includes(i)?'pip':''}"></i>`).join('')}<small>${v}</small></span>`).join('')}</span>`;}
  function curtain(s,api){return location.hash.includes('/match')&&api.active?.options.partner==='local'&&revealed!==api.active.seed+'-'+s.turnNumber&&!g.status(s).ended;}
  window.LudiaPrivate={domino:curtain};
  window.LudiaViews.domino=(s,interactive,api)=>{
    const {t,esc,button}=api,legal=g.placements(s),end=g.status(s),hand=s.hands[s.turn-1],hidden=curtain(s,api);
    const table=`<section class="domino-table"><h2>${esc(t('table'))}</h2>${s.chain.length?`<div class="domino-ends"><span>${esc(t('leftEnd',{n:s.chain[0].left}))}</span><span>${esc(t('rightEnd',{n:s.chain.at(-1).right}))}</span></div><ol class="domino-chain">${s.chain.map(p=>`<li aria-label="${esc(t('tile',{a:p.left,b:p.right}))}">${tile(p.left,p.right)}</li>`).join('')}</ol>`:`<p class="empty-table">${esc(t('emptyTable'))}</p>`}</section>`;
    if(hidden)return table+`<section class="handover"><span aria-hidden="true">↔</span><h2>${esc(t('handover',{name:api.name(s.turn)}))}</h2><p>${esc(t('handHidden'))}</p>${button(t('showHand'),'reveal-hand')}</section>`;
    if(!interactive&&location.hash.includes('/match')&&!end.ended)return table+`<p class="domino-wait" role="status">${esc(t('thinking'))}</p>`;
    return table+`<section class="domino-hand"><h2>${esc(t('tilesOf',{name:api.name(s.turn)}))}</h2>${interactive?`<p>${esc(t('chooseTile'))}</p>`:''}<div class="hand-tiles">${hand.map(id=>{const [a,b]=g.tiles[id];return interactive?`<button type="button" data-ludia="select-tile" data-tile="${id}" class="hand-tile ${api.selected===id?'tile-selected':''} ${api.hintAction?.id===id?'tile-hint':''}" aria-label="${esc(t('tile',{a,b}))}" aria-pressed="${api.selected===id}">${tile(a,b)}</button>`:`<span class="hand-tile" role="img" aria-label="${esc(t('tile',{a,b}))}">${tile(a,b)}</span>`;}).join('')}</div>${interactive?`<div class="domino-play-actions">${button(t('placeLeft'),'place-left','secondary',api.selected!==null&&s.chain.length&&g.orient(s,api.selected,'left')?'':'disabled')}${button(t('placeRight'),'place-right','',api.selected!==null&&g.orient(s,api.selected,'right')?'':'disabled')}${button(t('drawTile'),'draw-tile','secondary',!legal.length&&s.stock.length?'':'disabled')}${button(t('passTurn'),'pass-turn','secondary',!legal.length&&!s.stock.length?'':'disabled')}</div>`:''}</section>`;
  };
  window.LudiaPanels.domino=(s,{t,esc,name})=>`<p class="stat-note">${esc(t('stock',{n:s.stock.length}))}</p>${[1,2].map(side=>`<p>${esc(t('remainingTiles',{name:name(side),n:s.hands[side-1].length}))}</p>`).join('')}${g.status(s).reason==='blocked'?`<p>${esc(t('blocked'))}</p>${[1,2].map(side=>`<p>${esc(t('remainingPips',{name:name(side),n:g.pips(s.hands[side-1])}))}</p>`).join('')}`:''}`;
  window.LudiaAction.domino=(action,control,s,api,course)=>{
    if(action==='reveal-hand'){revealed=api.active.seed+'-'+s.turnNumber;api.renderLocal();return;}
    if(curtain(s,api))return;
    if(action==='select-tile'){api.selected=Number(control.dataset.tile);api.renderLocal(`[data-tile="${api.selected}"]`);return;}
    const a=action==='draw-tile'?{type:'draw'}:action==='pass-turn'?{type:'pass'}:action==='place-left'||action==='place-right'?{type:'play',id:api.selected,end:action==='place-left'?'left':'right'}:null;
    if(a)course?api.tryExercise(a):api.commit(a);
  };
  window.LudiaHint.domino=(s,a,{t})=>a.type==='play'?t('dominoHint',{a:g.tiles[a.id][0],b:g.tiles[a.id][1],end:t(a.end==='left'?'endLeft':'endRight')}):t(a.type==='draw'?'drawTile':'passTurn');
}());
