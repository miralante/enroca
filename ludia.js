/* Shared catalogue, curriculum and session lifecycle. Game engines never touch DOM. */
(function () {
  'use strict';
  const G = window.LudiaGames, storage = window.App.storage;
  let ctx, active = null, exercise = null, timer = null, demo = false, message = '', hintAction = null, selected = null;
  let progress = storage.read('ludia-progress', {}), sessions = storage.read('ludia-sessions', {});
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) progress = {};
  if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) sessions = {};
  const locale = () => window.App.i18n.locale === 'en' ? 1 : 0;
  const tr = pair => Array.isArray(pair) ? pair[locale()] : String(pair || '');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const t = (key, args = {}) => tr(window.LudiaCopy[key] || [key, key]).replace(/\{(\w+)\}/g, (_, k) => args[k] ?? k);
  const url = (id, phase = '', step = '') => '#ludia/' + id + (phase ? '/' + phase : '') + (step !== '' ? '/' + step : '');
  const link = (label, href, cls = '') => `<a class="button ${cls}" href="${href}">${esc(label)}</a>`;
  const button = (label, action, cls = '', extra = '') => `<button type="button" class="button ${cls}" data-ludia="${action}" ${extra}>${esc(label)}</button>`;
  function coordinates(size,action,label) { return `<details class="coordinate-picker"><summary>${esc(t('largeControls'))}</summary><div class="coordinate-fields">${['row','column'].map(axis=>`<label>${esc(t(axis==='row'?'rowName':'columnName'))}<select class="large-select" data-coordinate="${axis}">${Array.from({length:size},(_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select></label>`).join('')}</div>${button(label,action,'secondary')}</details>`; }
  function columnPicker(s) { return `<details class="coordinate-picker"><summary>${esc(t('largeControls'))}</summary><label>${esc(t('columnName'))}<select class="large-select" data-four-column>${Array.from({length:7},(_,i)=>`<option value="${i}" ${s.board[i]?'disabled':''}>${i+1}</option>`).join('')}</select></label>${button(t('chooseCell'),'column-list','secondary')}</details>`; }
  const back = id => `<a class="breadcrumb" href="${id ? url(id) : '#home'}">← ${esc(t(id ? 'back' : 'all'))}</a>`;
  function stop() { clearTimeout(timer); timer = null; }
  function saveProgress() { ctx.save('ludia-progress', progress); }
  function record(id, kind, item) { if (!progress[id] || typeof progress[id] !== 'object') progress[id] = {}; if (!Array.isArray(progress[id][kind])) progress[id][kind] = []; if (!progress[id][kind].includes(item)) progress[id][kind].push(item); saveProgress(); }
  function count(g, kind) { return g.lessons.filter(l => Array.isArray(progress[g.id]?.[kind]) && progress[g.id][kind].includes(l.id)).length; }
  function illustration(g) {
    const id = g.id;
    if (id === 'tic-tac-toe') return '<div class="art-tic">' + ['✕','','○','','✕','','○','','✕'].map(x => `<span>${x}</span>`).join('') + '</div>';
    if (id === 'connect-four') return '<div class="art-four">' + Array.from({length:20},(_,i)=>`<i class="disc-${[0,0,0,0,0,0,1,0,0,0,2,1,2,0,0,1,1,2,2,0][i]}"></i>`).join('')+'</div>';
    if (id === 'battleship') return '<div class="art-sea"><span>⌁</span><b>▰▰▰</b><span>⌁</span><i>＋</i></div>';
    if (id === 'sudoku') return '<div class="art-sudoku">' + ['●','▲','■','★','■','★','●','▲','▲','●','★','■','★','■','▲','●'].map(x=>`<i>${x}</i>`).join('')+'</div>';
    if (id === 'tetris') return '<div class="art-tetris">' + Array.from({length:25},(_,i)=>`<i class="block-${[0,0,3,0,0,0,3,3,3,0,0,0,0,0,0,1,1,0,2,2,1,1,0,2,2][i]}"></i>`).join('')+'</div>';
    if (id === 'domino') return '<div class="art-domino"><b>⠿<hr>⠛</b><b>⠛<hr>⠶</b></div>';
    return `<div class="art-chess ${id === 'checkers' ? 'art-checkers' : ''}"><div></div><b>${id === 'checkers' ? '●' : '♞'}</b><i>${id === 'checkers' ? '♛' : '♙'}</i></div>`;
  }
  const chess = { id:'chess', title:window.LudiaCopy.chess, description:window.LudiaCopy.chessDesc, tag:window.LudiaCopy.chessTag, color:'lilac' };
  function home() {
    const games = [...G.catalog.filter(g => g.lessons), chess];
    return `<section class="ludia-hero"><div><p class="eyebrow">${esc(t('welcome'))}</p><h1>${esc(t('tagline')).replace('\n','<br>')}</h1><p>${esc(t('intro'))}</p><span class="pace-pill">✦ ${esc(t('pace'))}</span></div><div class="hero-play" aria-hidden="true"><span class="hero-star">✦</span><div class="hero-tile tile-one">${illustration(games[0])}</div><div class="hero-tile tile-two">${illustration(chess)}</div><div class="hero-tile tile-three"><span>●</span><span>▲</span><span>■</span></div><span class="hero-orbit">＋</span></div></section><section aria-labelledby="games-title"><div class="ludia-section"><h2 id="games-title">${esc(t('choose'))}</h2><span class="catalog-count">${games.length}</span></div><div class="game-catalog">${games.map(g=>`<a class="game-card theme-${g.color}" href="${url(g.id)}"><div class="game-art" aria-hidden="true">${illustration(g)}</div><div class="game-card-copy"><span class="game-tag">${esc(tr(g.tag))}</span><h3>${esc(tr(g.title))}</h3><p>${esc(tr(g.description))}</p><span class="card-open">${esc(t('open'))}<span aria-hidden="true">↗</span></span>${g.lessons && count(g,'exercises') ? `<span class="card-progress">✓ ${esc(t('solved',{n:count(g,'exercises'),total:g.lessons.length}))}</span>`:''}</div></a>`).join('')}</div></section><p class="local-note">◈ ${esc(t('local'))}</p>`;
  }
  function overview(g) {
    const isChess = g.id === 'chess';
    return `${back()}<section class="game-overview theme-${g.color}"><div class="overview-art" aria-hidden="true">${illustration(g)}</div><div><p class="eyebrow">${esc(tr(g.tag))}</p><h1>${esc(tr(g.title))}</h1><p>${esc(tr(g.description))}</p><span class="pace-pill">✦ ${esc(t('pace'))}</span></div></section><div class="phase-cards">${['rules','exercises','play'].map((phase,i)=>`<a class="phase-card" href="${isChess ? ['#learn','#exercise/all','#play'][i] : url(g.id,phase,phase === 'play' ? '' : 0)}"><span class="phase-number">${['▤','✦','▶'][i]}</span><h2>${esc(t(phase))}</h2><p>${esc(t(isChess && i<2 ? ['chessRules','chessExercises'][i] : ({rules:'ruleIntro',exercises:'exerciseIntro',play:'playIntro'})[phase]))}</p><span>${!isChess && i<2 ? esc(t(i===0?'read':'solved',{n:count(g,phase),total:g.lessons.length})):'→'}</span></a>`).join('')}</div>${isChess ? link(t('challenges'),'#minigames','secondary') : ''}`;
  }
  function phaseNav(g, phase) { return `<nav class="phase-tabs" aria-label="${esc(tr(g.title))}">${['rules','exercises','play'].map(p=>`<a href="${url(g.id,p,p==='play'?'':0)}" ${p===phase?'aria-current="page"':''}>${esc(t(p))}</a>`).join('')}</nav>`; }
  function curriculum(g, phase, raw) {
    const step = Math.max(0,Math.min(g.lessons.length,Number(raw)||0));
    if (step === g.lessons.length) return `${back(g.id)}${phaseNav(g,phase)}<section class="complete ludia-complete"><div class="complete-icon" aria-hidden="true">✦</div><h1>${esc(t(phase==='rules'?'markRead':'done'))}</h1><p>${esc(t(phase==='rules'?'exerciseIntro':'doneText'))}</p><div class="actions">${link(t(phase==='rules'?'exercises':'play'),url(g.id,phase==='rules'?'exercises':'play',phase==='rules'?0:''))}${link(t('again'),url(g.id,'exercises',0),'secondary')}</div></section>`;
    const lesson = g.lessons[step], key = g.id+'/'+step;
    if (!exercise || exercise.key!==key || exercise.phase!==phase) { exercise={key,phase,solved:false,help:false,feedback:'',state:lesson.setup ? G.copy(lesson.setup):null}; demo=false; selected=null; hintAction=null; }
    const isRule = phase==='rules';
    let boardState = exercise.state;
    if (isRule && lesson.setup) boardState = demo ? g.move(lesson.setup,lesson.solution) || lesson.setup : lesson.setup;
    const visual = lesson.kind==='board' ? renderBoard(g,boardState,!isRule && !exercise.solved) : `<div class="rule-art theme-${g.color}" aria-hidden="true">${illustration(g)}</div>`;
    return `${back(g.id)}${phaseNav(g,phase)}<div class="course-heading"><div><p class="eyebrow">${esc(t(isRule?'rule':'exercise'))} · ${esc(tr(g.title))}</p><h1>${esc(tr(lesson.title))}</h1></div><span class="step-pill">${esc(t('step',{n:step+1,total:g.lessons.length}))}</span></div><div class="course-progress" aria-hidden="true">${g.lessons.map((_,i)=>`<i class="${i<=step?'filled':''}"></i>`).join('')}</div><div class="course-layout"><section class="course-copy"><p class="course-instruction">${esc(tr(isRule?lesson.body:lesson.prompt))}</p>${!isRule && lesson.kind==='choice' ? `<div class="course-answers">${lesson.options.map((opt,i)=>button(tr(opt),'answer','secondary'+(exercise.solved && i===lesson.answer?' answer-correct':''),`data-answer-index="${i}" ${exercise.solved?'disabled':''}`)).join('')}</div>` : ''}${!isRule ? `<div class="course-feedback ${exercise.solved?'is-success':''}" role="status">${esc(exercise.feedback)}</div>${exercise.help?`<p class="hint-copy">✦ ${esc(tr(lesson.hint))}</p>`:''}<div class="actions">${button(t('hint'),'course-hint','secondary')}${link(t('rules'),url(g.id,'rules',step),'quiet')}</div>`:''}<div class="actions">${step?link(t('previous'),url(g.id,phase,step-1),'secondary'):''}${isRule?button(t(step===g.lessons.length-1?'markRead':'next'),'next-rule'):(exercise.solved?link(t('next'),url(g.id,phase,step+1)):'')}</div></section><section class="course-visual" aria-label="${esc(t('board'))}">${visual}${isRule && lesson.setup?button(t(demo?'resetExample':'example'),'demo','secondary'):''}</section></div><details class="course-index"><summary>${esc(t('progress'))}</summary><ol>${g.lessons.map((l,i)=>`<li><a href="${url(g.id,phase,i)}" ${i===step?'aria-current="step"':''}>${esc(tr(l.title))}${Array.isArray(progress[g.id]?.[phase])&&progress[g.id][phase].includes(l.id)?' ✓':''}</a></li>`).join('')}</ol></details>`;
  }
  function grid(g,s,rows,cols,interactive,cellInfo) {
    let cells='';
    for(let r=0;r<rows;r++) { cells+='<div role="row" class="ludia-row" style="--cols:'+cols+'">';
      for(let c=0;c<cols;c++) {const at=r*cols+c, cell=cellInfo(at,r,c), label=t('cell',{r:r+1,c:c+1,value:cell.label || t('empty')});
        cells+=`<${interactive?'button type="button"':'span'} role="gridcell" class="ludia-cell ${cell.cls||''}" ${interactive?`data-cell="${at}" tabindex="${at===0?0:-1}" aria-label="${esc(label)}"`: `aria-label="${esc(label)}"`}>${cell.html||''}</${interactive?'button':'span'}>`;
      } cells+='</div>';
    }
    return `<div class="ludia-board board-${g.id}" role="grid" aria-label="${esc(tr(g.title))}" data-cols="${cols}" style="--cols:${cols}">${cells}</div>${interactive?`<p class="sr-only">${esc(t('keyboard'))}</p>`:''}`;
  }
  function renderBoard(g,s,interactive=true) {
    if (g.id==='tic-tac-toe' || g.id==='connect-four') {
      const connect=g.id==='connect-four', end=g.status(s);
      return `${connect&&interactive?`<div class="column-buttons">${Array.from({length:7},(_,col)=>button('↓ '+(col+1),'column','',`data-col="${col}" aria-label="${esc(t('column',{n:col+1}))}" ${s.board[col]||end.ended?'disabled':''}`)).join('')}</div>`:''}${grid(g,s,connect?6:3,connect?7:3,interactive,(at)=>({html:s.board[at]?`<span aria-hidden="true">${s.board[at]===1?'✕':'○'}</span>`:'',label:s.board[at]?(s.board[at]===1?'✕':'○'):t('empty'),cls:`side-${s.board[at]} ${end.line.includes(at)?'winning':''} ${hintAction?.at===at || (connect&&hintAction?.col===at%7)?'hinted':''}`}))}${connect&&interactive?columnPicker(s):''}`;
    }
    return window.LudiaViews?.[g.id]?.(s,interactive,api) || '';
  }
  function restore(g) {
    if(active?.id===g.id) return active;
    active=null; const raw=sessions[g.id]; if(!raw) return null;
    try {
      if(raw.version!==1 || !Number.isInteger(raw.seed) || !Array.isArray(raw.actions) || raw.actions.length>60000 || !raw.options || typeof raw.options!=='object') return null;
      let state=g.init(raw.options,raw.seed), states=[state];
      for(const action of raw.actions) { state=g.move(state,action); if(!state) return null; states.push(state); }
      active={id:g.id,seed:raw.seed,options:raw.options,actions:raw.actions,states}; return active;
    } catch (_) { return null; }
  }
  function persist() { if(!active)return; sessions[active.id]={version:1,seed:active.seed,options:active.options,actions:active.actions}; ctx.save('ludia-sessions',sessions); }
  function setup(g) {
    const saved=restore(g);
    return `${back(g.id)}${phaseNav(g,'play')}<div class="course-heading"><h1>${esc(tr(g.title))}</h1><span class="pace-pill">✦ ${esc(t('pace'))}</span></div><div class="setup-layout"><div class="setup-art theme-${g.color}" aria-hidden="true">${illustration(g)}</div><form id="ludia-setup" class="setup-panel"><h2>${esc(t('options'))}</h2>${g.players?`<label>${esc(t('partner'))}<select name="partner"><option value="computer">${esc(t('computer'))}</option><option value="local">${esc(t('two'))}</option></select></label><label>${esc(t('difficulty'))}<select name="difficulty"><option value="gentle">${esc(t('gentle'))}</option><option value="thoughtful">${esc(t('thoughtful'))}</option></select></label>`:''}${window.LudiaOptions?.[g.id]?.(api)||''}<div class="actions"><button class="button" type="submit">${esc(t('start'))}</button>${saved?link(t('resume'),url(g.id,'match'),'secondary'):''}</div><p class="save-note">${esc(sessions[g.id]&&!saved?t('noSave'):t('saved'))}</p></form></div>`;
  }
  function name(side) { if(active?.options.partner!=='local'&&side===2)return 'Ludia'; return t('player',{n:side})+(active?.id==='tic-tac-toe'||active?.id==='connect-four'?(side===1?' · ✕':' · ○'):''); }
  function isComputer(s) { return active && active.options.partner!=='local' && s.turn===2 && s.phase!=='placement'; }
  function statusText(g,s) { const end=g.status(s); return end.ended?(end.winner?t('win',{name:name(end.winner)}):t('draw')):(isComputer(s)?t('thinking'):t('turn',{name:name(s.turn)})); }
  function match(g) {
    if(!restore(g)) return setup(g);
    const s=active.states.at(-1), end=g.status(s);
    return `${back(g.id)}${phaseNav(g,'play')}<div class="match-heading"><h1>${esc(tr(g.title))}</h1><span class="pace-pill">${esc(t('pace'))}</span></div><div class="match-layout"><section class="match-board">${renderBoard(g,s,!end.ended&&!isComputer(s))}</section><aside class="match-panel"><div class="turn-marker ${end.ended?'is-success':''}" role="status">${esc(window.LudiaStatus?.[g.id]?.(s,api)||statusText(g,s))}</div>${window.LudiaPanels?.[g.id]?.(s,api)||''}<p class="match-message" role="status">${esc(message)}</p><div class="match-tools">${button(t('hint'),'hint','secondary',end.ended||isComputer(s)||window.LudiaPrivate?.[g.id]?.(s,api)?'disabled':'')}${button(t('undo'),'undo','secondary',active.actions.length?'':'disabled')}${button(t('restart'),'new','secondary')}${link(t('rules'),url(g.id,'rules',0),'quiet')}</div><p class="save-note">${esc(t('saved'))}</p></aside></div>`;
  }
  function renderLocal(focusSelector) { const old=document.activeElement; const selector=focusSelector || (old?.dataset.ludia?`[data-ludia="${old.dataset.ludia}"]`:null); ctx.render(false); if(selector)ctx.main.querySelector(selector)?.focus({preventScroll:true}); }
  function commit(action) {
    if(!active) return false; const g=G.get(active.id), before=active.states.at(-1), next=g.move(before,action);
    if(!next) { message=t('invalid'); ctx.announce(message); renderLocal(); return false; }
    active.actions.push(G.copy(action)); active.states.push(next); hintAction=null; selected=null; message=''; persist();
    if(g.status(next).ended) { record(g.id,'matches','finished'); window.App.sound.play('success'); } else window.App.sound.play('move');
    renderLocal(action.at!==undefined?`[data-cell="${action.at}"]`:null); ctx.announce(window.LudiaStatus?.[g.id]?.(next,api)||statusText(g,next)); return true;
  }
  function schedule(g) {
    stop(); if(!active || document.hidden || document.getElementById('dialog').open)return;
    const s=active.states.at(-1); if(g.status(s).ended)return;
    if(isComputer(s)) timer=setTimeout(()=>{const current=active.states.at(-1); const actions=g.actions(current); const action=active.options.difficulty==='gentle'&&actions.length?actions[Math.floor(G.random(active.seed+active.actions.length)()*actions.length)]:g.hint(current); if(action)commit(action);},520);
    else if(g.id==='tetris') window.LudiaTick?.(s,api);
  }
  function answer(correct) {
    if(exercise.solved)return;
    exercise.solved=correct; exercise.feedback=t(correct?'correct':'retry');
    if(correct){ const [,id,,raw]=location.hash.slice(1).split('/'); const g=G.get(id), l=g.lessons[Number(raw)||0]; record(g.id,'exercises',l.id); window.App.sound.play('success'); }
    renderLocal(); ctx.announce(exercise.feedback);
  }
  function tryExercise(action) {
    const [,id,,raw]=location.hash.slice(1).split('/'), g=G.get(id), l=g.lessons[Number(raw)||0];
    const next=g.move(exercise.state,action); const correct=!!next && l.accept(action,next,exercise.state);
    if(correct)exercise.state=next; answer(correct);
  }
  function handle(parts,context) {
    ctx=context; stop();
    const [view,id,phase,step]=parts;
    if(!['','home','ludia'].includes(view)) return false;
    document.querySelectorAll('[data-nav]').forEach(el=>{ if(el.dataset.nav==='home')el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); });
    document.querySelector('.chess-navigation').hidden=true;
    if(view!=='ludia'){ ctx.main.innerHTML=home(); return true; }
    const g=id==='chess'?chess:G.get(id); if(!g || (!g.lessons&&id!=='chess')){ctx.main.innerHTML=home();return true;}
    if(id==='chess'){ctx.main.innerHTML=overview(g);return true;}
    if(phase!=='match'){message='';hintAction=null;}
    ctx.main.innerHTML=phase==='rules'||phase==='exercises'?curriculum(g,phase,step):phase==='play'?setup(g):phase==='match'?match(g):overview(g);
    if(phase==='match')schedule(g);
    return true;
  }
  document.addEventListener('submit',event=>{
    if(event.target.id!=='ludia-setup')return; event.preventDefault(); const id=location.hash.split('/')[1],g=G.get(id), data=new FormData(event.target), options=Object.fromEntries(data.entries());
    const start=()=>{const seed=crypto.getRandomValues(new Uint32Array(1))[0]; const state=g.init(options,seed); active={id,seed,options,actions:[],states:[state]}; message=''; selected=null; persist(); ctx.go('ludia/'+id+'/match');};
    if(sessions[id]?.actions?.length) ctx.confirm('ludia.replaceTitle','ludia.replaceText','ludia.confirm',start); else start();
  });
  document.addEventListener('click',event=>{
    const parts=location.hash.slice(1).split('/'); if(parts[0]!=='ludia')return;
    const g=G.get(parts[1]); if(!g)return;
    const control=event.target.closest('[data-ludia]'),cell=event.target.closest('[data-cell]');
    const course=parts[2]==='exercises', s=course?exercise?.state:active?.states.at(-1);
    if(cell){ const at=Number(cell.dataset.cell); if(course&&exercise.solved)return; if(!course&&(!active||isComputer(s)||g.status(s).ended))return;
      const action=window.LudiaCell?.[g.id]?.(at,s,api) || (g.id==='tic-tac-toe'?{at}:g.id==='connect-four'?{col:at%7}:null);
      if(action)course?tryExercise(action):commit(action); return;
    }
    if(!control||control.disabled)return;
    switch(control.dataset.ludia){
      case 'answer': answer(Number(control.dataset.answerIndex)===g.lessons[Number(parts[3])||0].answer);break;
      case 'course-hint': exercise.help=true;renderLocal();ctx.announce(tr(g.lessons[Number(parts[3])||0].hint));break;
      case 'next-rule': record(g.id,'rules',g.lessons[Number(parts[3])||0].id);ctx.go('ludia/'+g.id+'/rules/'+((Number(parts[3])||0)+1));break;
      case 'demo':demo=!demo;renderLocal();break;
      case 'column':{const a={col:Number(control.dataset.col)};course?tryExercise(a):commit(a);break;}
      case 'column-list':{const value=document.querySelector('[data-four-column]').value;if(value!==''){const a={col:Number(value)};course?tryExercise(a):commit(a);}break;}
      case 'hint':if(window.LudiaPrivate?.[g.id]?.(s,api))break;hintAction=g.hint(s); if(hintAction){message=window.LudiaHint?.[g.id]?.(s,hintAction,api)||(hintAction.col!==undefined?t('hintCol',{n:hintAction.col+1}):t('hintAt',{r:Math.floor(hintAction.at/3)+1,c:hintAction.at%3+1}));renderLocal();ctx.announce(message);}break;
      case 'undo':{stop();let n=1; if((g.players||g.id==='battleship')&&active.options.partner!=='local'&&s.phase!=='placement'){let index=active.states.length-2;while(index>0&&(active.states[index].turn!==1||active.states[index].forced!=null))index--;n=active.states.length-1-index;}active.actions.splice(-n);active.states.splice(-n);selected=null;hintAction=null;message='';persist();window.LudiaUndo?.(g,api);renderLocal();break;}
      case 'new':ctx.go('ludia/'+g.id+'/play');break;
      default:window.LudiaAction?.[g.id]?.(control.dataset.ludia,control,s,api,course);
    }
  });
  document.addEventListener('keydown',event=>{
    const cell=event.target.closest('[data-cell]');if(!cell)return;
    const board=cell.closest('[data-cols]'), cols=Number(board.dataset.cols), cells=[...board.querySelectorAll('[data-cell]')], i=cells.indexOf(cell);
    const next={ArrowLeft:Math.max(Math.floor(i/cols)*cols,i-1),ArrowRight:Math.min(Math.floor(i/cols)*cols+cols-1,i+1),ArrowUp:Math.max(0,i-cols),ArrowDown:Math.min(cells.length-1,i+cols),Home:event.ctrlKey?0:Math.floor(i/cols)*cols,End:event.ctrlKey?cells.length-1:Math.floor(i/cols)*cols+cols-1}[event.key];
    if(next!==undefined){event.preventDefault();cells.forEach(c=>c.tabIndex=-1);cells[next].tabIndex=0;cells[next].focus();}
  });
  document.addEventListener('visibilitychange',()=>{stop(); if(!document.hidden&&location.hash.includes('/match')&&active)schedule(G.get(active.id));});
  window.addEventListener('pagehide',stop);
  const api={tr,t,esc,button,link,url,grid,coordinates,renderBoard,commit,tryExercise,renderLocal,stop, name,statusText, isComputer,
    get selected(){return selected;},set selected(v){selected=v;},get hintAction(){return hintAction;},get active(){return active;},get exercise(){return exercise;},get message(){return message;},set message(v){message=v;},get ctx(){return ctx;},setTimer(fn,ms){stop();timer=setTimeout(fn,ms);}};
  window.Ludia={handle,stop,api,reset(){stop();active=null;exercise=null;sessions={};progress={};message='';selected=null;}};
}());
