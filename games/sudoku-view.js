(function(){
  'use strict';
  const G=window.LudiaGames;
  Object.assign(window.LudiaCopy,{
    sudokuSize:['Tamaño del sudoku','Sudoku size'],fourShapes:['4 formas · 4 × 4','4 shapes · 4 × 4'],sixShapes:['6 formas · 6 × 6','6 shapes · 6 × 6'],clues:['Pistas iniciales','Starting clues'],moreClues:['Más pistas','More clues'],fewerClues:['Menos pistas','Fewer clues'],notes:['Notas','Notes'],notesOn:['Notas activadas','Notes on'],erase:['Borrar forma','Erase shape'],chooseSpace:['Elige un hueco y después una forma.','Choose a space, then a shape.'],fixed:['pista fija','fixed clue'],note:['nota','note'],repeated:['forma repetida','repeated shape'],shape1:['círculo','circle'],shape2:['triángulo','triangle'],shape3:['cuadrado','square'],shape4:['estrella','star'],shape5:['rombo','diamond'],shape6:['cruz','cross'],filled:['{n} de {total} casillas completas','{n} of {total} spaces filled'],sudokuDone:['¡Sudoku completado!','Sudoku complete!'],sudokuGood:['No hay formas repetidas. Sigue con los huecos.','No shapes repeat. Keep filling the empty spaces.'],sudokuConflict:['Hay formas repetidas. Mira las casillas con !.','Some shapes repeat. Look at the spaces marked !.'],sudokuHint:['En la fila {r}, columna {c}, prueba {shape}.','In row {r}, column {c}, try {shape}.'],showNumbers:['Mostrar números','Show numbers'],selectFirst:['Primero elige una casilla que puedas cambiar.','First choose a space you can change.']
  });
  const shapes=['','●','▲','■','★','◆','✚'];let notes=false,checkSudoku=false,numbers=false,contextKey='';
  window.LudiaOptions.sudoku=({t,esc})=>`<label>${esc(t('sudokuSize'))}<select name="size"><option value="4">${esc(t('fourShapes'))}</option><option value="6">${esc(t('sixShapes'))}</option></select></label><label>${esc(t('clues'))}<select name="difficulty"><option value="gentle">${esc(t('moreClues'))}</option><option value="challenge">${esc(t('fewerClues'))}</option></select></label>`;
  window.LudiaViews.sudoku=(s,interactive,api)=>{
    const key=location.hash+(location.hash.includes('/match')?api.active?.seed:'');
    if(key!==contextKey){notes=false;checkSudoku=false;contextKey=key;}
    const {grid,t,esc,button}=api,g=G.get('sudoku'),conflicts=checkSudoku?g.conflicts(s):[];
    return `<div class="sudoku-wrap">${grid(g,s,s.size,s.size,interactive,(at,r,c)=>({html:s.board[at]?`<span aria-hidden="true" class="shape shape-${s.board[at]}">${shapes[s.board[at]]}</span>${numbers?`<small class="shape-number">${s.board[at]}</small>`:''}${conflicts.includes(at)?'<b class="conflict-mark">!</b>':''}`:`<span class="sudoku-notes">${s.notes[at].map(v=>shapes[v]).join(' ')}</span>`,label:(s.board[at]?t('shape'+s.board[at]):t('empty'))+(s.givens[at]?', '+t('fixed'):'')+(s.notes[at].length?', '+t('note')+': '+s.notes[at].map(v=>t('shape'+v)).join(', '):'')+(conflicts.includes(at)?', '+t('repeated'):''),cls:`${s.givens[at]?'given':''} ${api.selected===at?'cell-selected':''} ${conflicts.includes(at)?'conflict':''} ${c%(s.size/2)===(s.size/2)-1&&c!==s.size-1?'box-right':''} ${r%2===1&&r!==s.size-1?'box-bottom':''} ${api.hintAction?.at===at?'hinted':''}`}))}${interactive?`<div class="shape-palette">${shapes.slice(1,s.size+1).map((shape,i)=>button(shape,'shape','secondary',`data-value="${i+1}" aria-label="${esc(t('shape'+(i+1)))}"`)).join('')}</div><div class="sudoku-tools">${button(t(notes?'notesOn':'notes'),'notes','secondary',`aria-pressed="${notes}"`)}${button(t('erase'),'erase','secondary')}${button(t('showNumbers'),'numbers','quiet',`aria-pressed="${numbers}"`)}</div>`:''}</div>`;
  };
  window.LudiaStatus.sudoku=(s,{t})=>G.get('sudoku').status(s).ended?t('sudokuDone'):t('chooseSpace');
  window.LudiaPanels.sudoku=(s,{t,esc,button})=>`<p class="stat-note">${esc(t('filled',{n:s.board.filter(Boolean).length,total:s.size*s.size}))}</p>${button(t('check'),'check-sudoku','secondary')}`;
  window.LudiaCell.sudoku=(at,s,api)=>{if(s.givens[at]){api.message=api.t('fixed');api.renderLocal(`[data-cell="${at}"]`);return null;}api.selected=at;api.renderLocal(`[data-cell="${at}"]`);return null;};
  window.LudiaAction.sudoku=(action,control,s,api,course)=>{
    if(action==='sudoku-coordinate'){const picker=control.closest('.coordinate-picker'),at=Number(picker.querySelector('[data-coordinate="row"]').value)*s.size+Number(picker.querySelector('[data-coordinate="column"]').value);window.LudiaCell.sudoku(at,s,api);return;}
    if(action==='notes'){notes=!notes;api.renderLocal();return;}if(action==='numbers'){numbers=!numbers;api.renderLocal();return;}
    if(action==='check-sudoku'){checkSudoku=true;api.message=api.t(G.get('sudoku').conflicts(s).length?'sudokuConflict':'sudokuGood');api.renderLocal();api.ctx.announce(api.message);return;}
    if(!['shape','erase'].includes(action))return;
    if(api.selected===null||s.givens[api.selected]){api.message=api.t('selectFirst');api.renderLocal();api.ctx.announce(api.message);return;}
    const a={type:action==='erase'||!notes?'set':'note',at:api.selected,value:action==='erase'?0:Number(control.dataset.value)};
    course?api.tryExercise(a):api.commit(a);
  };
  window.LudiaHint.sudoku=(s,a,{t})=>t('sudokuHint',{r:Math.floor(a.at/s.size)+1,c:a.at%s.size+1,shape:shapes[a.value]+' '+t('shape'+a.value)});
  const view=window.LudiaViews.sudoku;window.LudiaViews.sudoku=(s,interactive,api)=>view(s,interactive,api)+(interactive?api.coordinates(s.size,'sudoku-coordinate',api.t('chooseCell')):'');
}());
