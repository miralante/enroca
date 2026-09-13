(function(){
  'use strict';
  const G=window.LudiaGames;
  const views=window.LudiaViews={},options=window.LudiaOptions={},panels=window.LudiaPanels={},statuses=window.LudiaStatus={},cells=window.LudiaCell={},actions=window.LudiaAction={},hints=window.LudiaHint={};
  Object.assign(window.LudiaCopy,{
    seaSize:['Tamaño del mar','Sea size'],smallSea:['Mar pequeño · 6 × 6 · 3 barcos','Small sea · 6 × 6 · 3 ships'],largeSea:['Mar grande · 8 × 8 · 4 barcos','Large sea · 8 × 8 · 4 ships'],yourSea:['Tu mar','Your sea'],enemySea:['Mar de Ludia','Ludia’s sea'],autoPlace:['Colocar automáticamente','Place automatically'],clearShips:['Quitar los barcos','Remove all ships'],removeShip:['Quitar el último barco','Remove the last ship'],rotate:['Girar barco','Rotate ship'],horizontal:['Horizontal','Horizontal'],vertical:['Vertical','Vertical'],placeShip:['Coloca un barco de {n} casillas.','Place a ship of {n} spaces.'],fleetReady:['Tu flota está lista.','Your fleet is ready.'],startBattle:['Empezar los disparos','Start firing'],hit:['tocado','hit'],water:['agua','water'],ship:['barco','ship'],sunk:['hundido','sunk'],unknown:['sin explorar','unexplored'],fleetCount:['Barcos hundidos: {n} de {total}','Ships sunk: {n} of {total}'],seaHint:['Prueba la fila {r}, columna {c} del mar de Ludia.','Try row {r}, column {c} in Ludia’s sea.'],placeHint:['Puedes colocar toda la flota con el botón automático.','You can place the whole fleet with the automatic button.'],shotReport:['Tu último disparo: {result}.','Your last shot: {result}.'],placementHelp:['Elige la primera casilla del barco. Puedes girarlo antes de colocarlo.','Choose the ship’s first space. You can rotate it before placing it.']
  });
  let vertical=false;
  Object.assign(window.LudiaCopy,{largeControls:['Elegir con controles grandes','Choose with large controls'],rowName:['Fila','Row'],columnName:['Columna','Column'],chooseCell:['Elegir casilla','Choose space'],fireHere:['Disparar aquí','Fire here'],placeHere:['Colocar aquí','Place here']});
  options.battleship=({t,esc})=>`<label>${esc(t('seaSize'))}<select name="size"><option value="6">${esc(t('smallSea'))}</option><option value="8">${esc(t('largeSea'))}</option></select></label>`;
  views.battleship=(s,interactive,api)=>{
    const {t,esc,grid}=api,g=G.get('battleship'),end=g.status(s),placement=s.phase==='placement';
    const sea=(own)=>{
      const shotList=s.shots[own?1:0],fleet=s.ships[own?0:1],sunk=g.sunk(s,own?0:1).flat();
      return grid(g,s,s.size,s.size,interactive&&(placement?own:!own),at=>{
        const shot=shotList.find(x=>x.at===at),hasShip=fleet.some(ship=>ship.includes(at)),showShip=hasShip&&(own||end.ended),isSunk=sunk.includes(at);
        return {html:shot?(shot.hit?(isSunk?'◆':'✕'):'·'):showShip?'▰':'',label:shot?t(shot.hit?(isSunk?'sunk':'hit'):'water'):showShip?t('ship'):t('unknown'),cls:`sea-cell ${showShip?'has-ship':''} ${shot?.hit?'shot-hit':''} ${shot&&!shot.hit?'shot-miss':''} ${isSunk?'ship-sunk':''} ${!own&&api.hintAction?.at===at?'hinted':''}`};
      });
    };
    return `<div class="sea-boards">${placement?`<h2>${esc(t('yourSea'))}</h2>${sea(true)}${interactive?`<div class="actions">${api.button(t('rotate')+' · '+t(vertical?'vertical':'horizontal'),'rotate','secondary')}</div>`:''}`:`<h2>${esc(t('enemySea'))}</h2>${sea(false)}<div class="sea-legend"><span>· ${esc(t('water'))}</span><span>✕ ${esc(t('hit'))}</span><span>◆ ${esc(t('sunk'))}</span></div>${location.hash.includes('/match')?`<details class="own-sea"><summary>${esc(t('yourSea'))} · ${esc(t('fleetCount',{n:g.sunk(s,0).length,total:s.fleet.length}))}</summary>${sea(true)}</details>`:''}`}</div>`;
  };
  statuses.battleship=(s,api)=>s.phase==='placement'?api.t(s.ships[0].length===s.fleet.length?'fleetReady':'placeShip',{n:s.fleet[s.ships[0].length]}):api.statusText(G.get('battleship'),s);
  panels.battleship=(s,{t,esc,button})=>s.phase==='placement'?`<p class="save-note">${esc(t('placementHelp'))}</p><div class="ship-actions">${button(t('autoPlace'),'auto-place','secondary')}${button(t('removeShip'),'remove-ship','secondary',s.ships[0].length?'':'disabled')}${button(t('clearShips'),'clear-ships','secondary',s.ships[0].length?'':'disabled')}${button(t('startBattle'),'start-battle','',s.ships[0].length===s.fleet.length?'':'disabled')}</div>`:`<p class="stat-note">${esc(t('fleetCount',{n:G.get('battleship').sunk(s,1).length,total:s.fleet.length}))}</p>${s.shots[0].length?`<p>${esc(t('shotReport',{result:t(s.shots[0].at(-1).hit?'hit':'water')}))}</p>`:''}`;
  cells.battleship=(at,s)=>s.phase==='placement'?{type:'place',at,vertical}:{type:'fire',at};
  actions.battleship=(action,_control,s,api)=>{
    if(action==='rotate'){vertical=!vertical;api.renderLocal();return;}
    if(action==='sea-coordinate'){const picker=_control.closest('.coordinate-picker'),at=Number(picker.querySelector('[data-coordinate="row"]').value)*s.size+Number(picker.querySelector('[data-coordinate="column"]').value);const a=cells.battleship(at,s);location.hash.includes('/exercises/')?api.tryExercise(a):api.commit(a);return;}
    const type={'auto-place':'auto','clear-ships':'clear','remove-ship':'remove','start-battle':'start'}[action];if(type)api.commit({type});
  };
  hints.battleship=(s,a,{t})=>s.phase==='placement'?t('placeHint'):t('seaHint',{r:Math.floor(a.at/s.size)+1,c:a.at%s.size+1});
  const seaView=views.battleship;views.battleship=(s,interactive,api)=>seaView(s,interactive,api)+(interactive?api.coordinates(s.size,'sea-coordinate',api.t(s.phase==='placement'?'placeHere':'fireHere')):'');
}());
