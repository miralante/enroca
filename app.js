(function () {
  'use strict';
  const { i18n, storage, sound } = window.App;
  const C = window.EnrocaChess, lessons = window.EnrocaLessons, M = window.EnrocaMini;
  const main = document.getElementById('main'), dialog = document.getElementById('dialog');
  const t = (key, args) => i18n.t(key, args);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const allExercises = lessons.flatMap(lesson => lesson.exercises.map(exercise => ({ ...exercise, lesson })));
  const defaults = { lang: 'es', size: 'regular', contrast: false, names: false, sounds: false };
  const storedSettings = storage.read('settings', {});
  let settings = { ...defaults };
  if (storedSettings && typeof storedSettings === 'object') {
    settings = { lang: storedSettings.lang === 'en' ? 'en' : 'es', size: storedSettings.size === 'large' ? 'large' : 'regular', contrast: storedSettings.contrast === true, names: storedSettings.names === true, sounds: storedSettings.sounds === true };
  }
  const queryLang = new URLSearchParams(location.search).get('lang');
  if (['es', 'en'].includes(queryLang)) settings.lang = queryLang;
  else if (!storedSettings || !['es', 'en'].includes(storedSettings.lang)) settings.lang = (navigator.languages || [navigator.language]).some(l => l && l.startsWith('es')) ? 'es' : (navigator.language || '').startsWith('en') ? 'en' : 'es';
  let progress = { lessons: [], exercises: {}, minigames: {} };
  const savedProgress = storage.read('progress', null);
  if (savedProgress && typeof savedProgress === 'object') {
    progress.lessons = [...new Set((Array.isArray(savedProgress.lessons) ? savedProgress.lessons : []).filter(id => lessons.some(l => l.id === id)))];
    for (const q of allExercises) if (savedProgress.exercises && ['independent', 'supported'].includes(savedProgress.exercises[q.id])) progress.exercises[q.id] = savedProgress.exercises[q.id];
  }
  for (const challenge of M.catalog) if (savedProgress?.minigames && ['independent', 'supported'].includes(savedProgress.minigames[challenge.id])) progress.minigames[challenge.id] = savedProgress.minigames[challenge.id];
  let mini = null, miniReturn = null, listOpen = false;
  let game = restoreGame(storage.read('game', null));
  let selected = null, gameHint = null, gameMessage = '', aiTimer = null;
  let practice = null, practiceReturn = false, exampleMoved = false;
  let modalReturn = null, announcementTimer = null;
  function save(key, value) { storage.write(key, value); syncNotices(); }
  function syncNotices() {
    document.getElementById('connection').hidden = navigator.onLine !== false;
    document.getElementById('storage-notice').hidden = storage.available;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  }
  function announce(message) {
    clearTimeout(announcementTimer);
    const live = document.getElementById('announcer'); live.textContent = '';
    announcementTimer = setTimeout(() => { live.textContent = message; }, 40);
  }
  function icon(name) {
    const shapes = {
      arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
      book: '<path d="M12 6C8 3 4 4 3 5v15c3-2 6-1 9 1 3-2 6-3 9-1V5c-3-1-6-2-9 1Zm0 0v15"/>',
      check: '<path d="m5 12 4 4L19 6"/><path d="M20 13v7H3V3h12"/>',
      leaf: '<path d="M20 3C6 1 0 12 8 18c8 6 14-5 12-15ZM6 21 17 8"/>',
      sound: '<path d="m12 3-6 5H2v8h4l6 5V3Zm4 5c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.arrow}</svg>`;
  }
  function pieceSvg(piece) {
    const type = piece.toLowerCase(), white = piece === piece.toUpperCase();
    const paths = {
      p: '<circle cx="30" cy="17" r="9"/><path d="M24 26h12l-3 8 5 12H22l5-12Zm-5 21h22l3 8H16Z"/>',
      r: '<path d="M14 9h8v8h5V9h7v8h5V9h8v16l-7 5 2 17H20l2-17-8-5Zm4 39h25l3 8H15Z"/><path d="M22 29h18M21 43h20" fill="none"/>',
      b: '<path d="M30 5c-3 9-12 11-12 20 0 7 5 10 12 10s12-3 12-10C42 16 33 14 30 5ZM26 35h8l5 12H21Zm-8 13h24l4 8H14Z"/><path d="m33 15-8 11" fill="none"/>',
      n: '<path d="M21 10 28 4l5 9c17 4 15 19 11 28l-1 7H20l5-14-11 3-5-8 10-12Zm-3 39h26l3 7H14Z"/><path d="m20 18 5-3M27 34c7-2 11-8 8-13" fill="none"/><circle cx="24" cy="21" r="1.3" fill="'+(white?'#223d36':'#fffaf0')+'" stroke="none"/>',
      q: '<path d="m13 18 8 8 9-15 9 15 8-8-6 24H19Zm6 25h22v6H19Zm-2 7h26l3 6H14Z"/><circle cx="12" cy="15" r="4"/><circle cx="30" cy="8" r="4"/><circle cx="48" cy="15" r="4"/>',
      k: '<path d="M30 3v14m-6-8h12" fill="none"/><path d="M30 21c-16-14-23 6-9 16l-1 9h20l-1-9c14-10 7-30-9-16ZM18 48h24l4 8H14Z"/><path d="M30 22v15m-9 0h18" fill="none"/>'
    };
    return `<svg class="piece-fill" viewBox="0 0 60 60" fill="${white ? '#fffaf0' : '#263e34'}" stroke="${white ? '#263e34' : '#fffaf0'}" stroke-width="${white ? 2.5 : 1.8}" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${paths[type]}</svg>`;
  }
  function button(key, action, kind = '', args = '') { return `<button type="button" class="button ${kind}" data-action="${action}" ${args}>${esc(t(key))}</button>`; }
  function link(key, hash, kind = '') { return `<a class="button ${kind}" href="#${hash}">${esc(t(key))}</a>`; }
  function breadcrumb(hash = 'home', key = 'nav.home') { return `<a class="breadcrumb" href="#${hash}"><span aria-hidden="true">←</span> ${esc(t(key))}</a>`; }
  function applySettings() {
    i18n.set(settings.lang);
    sound.enabled = settings.sounds;
    if (!settings.sounds) sound.stop();
    document.documentElement.classList.toggle('large-text', settings.size === 'large');
    document.documentElement.classList.toggle('high-contrast', settings.contrast);
    document.documentElement.classList.toggle('piece-names', settings.names);
    document.title = t('app.title');
    document.querySelector('meta[name="description"]').content = t('app.description');
    document.querySelector('.chess-navigation').setAttribute('aria-label', t('ludia.chess'));
    syncNotices();
  }
  function route() { return location.hash.slice(1).split('/'); }
  function go(hash) { if (location.hash === '#' + hash) render(); else location.hash = hash; }
  function render(focus = true) {
    clearTimeout(aiTimer); aiTimer = null;
    window.Ludia.stop();
    applySettings();
    document.querySelector('.chess-navigation').hidden = !['learn','lesson','exercise','practice','practice-done','minigames','minigame','play','game'].includes(route()[0]);
    if (window.Ludia.handle(route(), { main, settings, save, announce, go, render, confirm })) {
      if (focus) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
      return;
    }
    const [view, id, step] = route();
    document.querySelectorAll('[data-nav]').forEach(el => {
      const current = el.dataset.nav === (['lesson', 'learn', ''].includes(view) ? 'home' : ['exercise', 'practice-done', 'minigames', 'minigame'].includes(view) ? 'practice' : view === 'game' ? 'play' : view);
      if (current) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    switch (view) {
      case 'learn': main.innerHTML = renderLearn(); break;
      case 'lesson': main.innerHTML = renderLesson(id, step); break;
      case 'practice': main.innerHTML = renderPractice(); break;
      case 'exercise': if (!practice) startPractice(id || 'all', false); main.innerHTML = renderExercise(); break;
      case 'practice-done': main.innerHTML = renderPracticeDone(); break;
      case 'minigames': main.innerHTML = renderMinigames(); break;
      case 'minigame': if (!mini || mini.state.id !== id) startMini(id); main.innerHTML = mini ? renderMini() : renderMinigames(); break;
      case 'play': main.innerHTML = renderPlay(); break;
      case 'game': main.innerHTML = game ? renderGame() : renderPlay(); scheduleAI(); break;
      case 'settings': main.innerHTML = renderSettings(); break;
      case 'privacy': main.innerHTML = renderPrivacy(); break;
      default: main.innerHTML = renderHome();
    }
    applySettings();
    if (focus) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  function boardIcon() {
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="2" fill="#fffaf0" stroke="#263e34" stroke-width="2"/>${Array.from({ length: 16 }, (_, i) => (Math.floor(i / 4) + i % 4) % 2 ? `<rect x="${2 + i % 4 * 9}" y="${2 + Math.floor(i / 4) * 9}" width="9" height="9" fill="#263e34"/>` : '').join('')}</svg>`;
  }
  function lessonCard(lesson) {
    const complete = lesson.exercises.every(q => progress.exercises[q.id]);
    return `<a class="lesson-card" href="#lesson/${lesson.id}/0"><span class="piece-icon">${lesson.id === 'board' ? boardIcon() : pieceSvg(lesson.piece.toUpperCase())}</span><div><h3>${esc(t('lesson.' + lesson.id + '.title'))}</h3></div><span class="lesson-arrow" aria-hidden="true">${complete ? '✓' : '→'}</span></a>`;
  }
  function renderHome() {
    const groups = [['board', ['board', 'turns']], ['pieces', ['rook', 'bishop', 'queen', 'king', 'knight', 'pawn']], ['match', ['capture', 'check', 'castle', 'promotion', 'enpassant', 'draw']]];
    return `<div class="page-intro home-intro"><h1>${esc(t('app.tagline'))}</h1></div>${groups.map(([group, ids]) => `<section class="topic-group"><h2>${esc(t('topics.' + group))}</h2><div class="lesson-list">${lessons.filter(l => ids.includes(l.id)).map(lessonCard).join('')}</div></section>`).join('')}${miniBanner()}`;
  }
  function renderLearn() { return renderHome(); }
  function diagramBoard(lesson, moved = false) {
    const board = Array(64).fill(null);
    Object.entries(lesson.pos).forEach(([s, p]) => { board[C.index(s)] = p; });
    if (moved && lesson.move) {
      const [from, to] = lesson.move.map(C.index);
      board[to] = lesson.promote ? 'Q' : board[from]; board[from] = null;
      if (lesson.castle) { board[C.index('h1')] = null; board[C.index('f1')] = 'R'; }
      if (lesson.ep) board[C.index(lesson.ep)] = null;
    }
    return board;
  }
  function renderBoard(board, options = {}) {
    const { interactive = false, marks = [], chosen = null, last = [], label = 'play.board', focusAt = 56, size = 8, target = -1, king = -1, attacker = -1, movers = [], coordinates = false, hideCoordinates = false } = options;
    const visible = M.squares(size), focusSquare = visible.includes(focusAt) ? focusAt : visible[0];
    const cells = visible.map(i => {
      const p = board[i], marked = marks.includes(i), square = C.square(i);
      let description = p ? t('play.square', { square, side: t('play.' + (C.color(p) === 'w' ? 'white' : 'black')), piece: t('piece.' + p.toLowerCase()) }) : t('play.empty', { square });
      if (chosen === i) description += ', ' + t('play.selectedLabel');
      if (marked) description += ', ' + t(p ? 'play.captureLabel' : 'play.destinationLabel');
      if (target === i) description += ', ' + t('mini.flag');
      if (king === i) description += ', ' + t('mini.kingLabel');
      if (attacker === i) description += ', ' + t('mini.attackerLabel');
      if (movers.includes(i)) description += ', ' + t('mini.movable');
      const cls = `square ${(Math.floor(i / 8) + i % 8) % 2 ? 'dark' : ''} ${chosen === i ? 'selected' : ''} ${marked ? 'destination' : ''} ${marked && p ? 'capture' : ''} ${last.includes(i) ? 'last' : ''} ${target === i ? 'mini-target' : ''} ${king === i ? 'mini-king' : ''}`;
      const badge = target === i ? '<span class="mini-badge" aria-hidden="true">⚑</span>' : king === i ? '<span class="mini-badge" aria-hidden="true">♔</span>' : attacker === i ? '<span class="mini-badge threat-badge" aria-hidden="true">!</span>' : '';
      const content = `${p ? pieceSvg(p) : ''}${badge}<span class="coord" aria-hidden="true">${square}</span>${p ? `<span class="piece-name" aria-hidden="true">${esc(t('piece.' + p.toLowerCase()))}</span>` : ''}`;
      return interactive ? `<button type="button" class="${cls}" role="gridcell" data-square="${i}" tabindex="${i === focusSquare ? 0 : -1}" aria-label="${esc(description)}" aria-selected="${chosen === i}">${content}</button>` : `<span class="${cls}" aria-hidden="true">${content}</span>`;
    });
    let body = cells.join('');
    if (interactive) { body = ''; for (let row = 0; row < size; row++) body += `<div class="board-row" role="row">${cells.slice(row * size, row * size + size).join('')}</div>`; }
    const description = interactive ? t(label) : t(label) + '. ' + board.map((p, i) => p ? t('play.square', { square: C.square(i), side: t('play.' + (C.color(p) === 'w' ? 'white' : 'black')), piece: t('piece.' + p.toLowerCase()) }) : '').filter(Boolean).join('. ') + (marks.length ? '. ' + t('play.destinationLabel') + ': ' + marks.map(C.square).join(', ') : '');
    return `<div class="board-frame"><div class="board board-size-${size} ${coordinates ? 'board-coordinates' : ''} ${hideCoordinates ? 'hide-coordinates' : ''}" data-board-size="${size}" role="${interactive ? 'grid' : 'img'}" aria-label="${esc(description)}">${body}</div>${interactive ? `<p class="board-keyboard sr-only">${esc(t('play.keyboard'))}</p>` : ''}</div>`;
  }
  function renderLesson(id, rawStep) {
    let lesson = lessons.find(l => l.id === id) || lessons[0];
    const total = lesson.steps + lesson.exercises.length;
    const step = Math.max(0, Math.min(total, Number(rawStep) || 0));
    if (step === total) return renderTopicDone(lesson);
    if (step >= lesson.steps) {
      const at = step - lesson.steps;
      if (!practice || practice.topicId !== lesson.id || practice.at !== at) {
        startPractice(lesson.id, false); practice.at = at; practice.topicId = lesson.id;
      }
      return renderExercise();
    }
    if (lesson.id === 'pawn' && step < 2) lesson = { ...lesson, marks: [step === 0 ? 'd3' : 'd4'], move: ['d2', step === 0 ? 'd3' : 'd4'] };
    if (lesson.id === 'board') lesson = { ...lesson, focus: step === 1 ? 'a1' : null, marks: step === 1 ? ['a1'] : [] };
    const prefix = 'lesson.' + lesson.id;
    return `${breadcrumb('home', 'nav.home')}<div class="topic-heading"><h1>${esc(t(prefix + '.title'))}</h1></div><div class="lesson-layout"><section class="lesson-text"><p class="lesson-instruction">${esc(t(prefix + '.step.' + step))}</p><div class="actions">${step ? link('common.previous', `lesson/${lesson.id}/${step - 1}`, 'secondary') : ''}${link('common.next', `lesson/${lesson.id}/${step + 1}`)}</div>${practiceReturn ? `<div class="actions">${button('practice.return', 'return-exercise', 'quiet')}</div>` : ''}${miniReturn === lesson.id && mini ? `<div class="actions">${link('mini.return', 'minigame/' + mini.state.id, 'secondary')}</div>` : ''}</section><div class="board-example">${renderBoard(diagramBoard(lesson, exampleMoved), { marks: exampleMoved ? [] : (lesson.marks || []).map(C.index), chosen: C.index(exampleMoved && lesson.move ? lesson.move[1] : lesson.focus), label: 'learn.diagram', coordinates: lesson.id === 'board', hideCoordinates: lesson.id === 'board' && step === 0 })}${lesson.move ? `<div class="actions">${button(exampleMoved ? 'learn.reset' : 'learn.example', 'example', 'secondary')}</div>` : ''}</div></div>`;
  }
  function renderTopicDone(lesson) {
    const next = lessons[lessons.indexOf(lesson) + 1];
    return `${breadcrumb('home', 'nav.home')}<section class="complete"><div class="complete-icon" aria-hidden="true">✓</div><h1>${esc(t('lesson.' + lesson.id + '.title'))}</h1><div class="actions">${next ? `<a class="button" href="#lesson/${next.id}/0">${esc(t('lesson.' + next.id + '.title'))}${icon('arrow')}</a>` : link('nav.play', 'play')}${link('mini.open', 'minigames', 'secondary')}${link('common.again', 'lesson/' + lesson.id + '/0', 'quiet')}</div></section>`;
  }
  function finishLesson(id) { go('lesson/' + id + '/' + (lessons.find(l => l.id === id)?.steps || 0)); }
  function renderPractice() { return renderMinigames(); }
  function startPractice(id, navigate = true) {
    let questions = allExercises.filter(q => id === 'all' || q.lesson.id === id);
    if (!questions.length) { id = 'all'; questions = allExercises.slice(); }
    practice = { id, questions, at: 0, hinted: false, corrected: false, solved: false, selected: false, hintVisible: false, message: '' };
    practiceReturn = false;
    if (navigate) go('exercise/' + id);
  }
  function renderExercise() {
    const q = practice.questions[practice.at];
    if (!q) return renderPracticeDone();
    const offset = allExercises.findIndex(item => item.id === q.id) % 3;
    const answerList = Array.from({ length: q.options || 0 }, (_, i) => (i + offset) % q.options);
    let content;
    if (q.type === 'choice') content = `<div class="answer-list">${answerList.map((option, i) => `<button type="button" class="answer ${practice.solved && option === q.answer ? 'correct' : ''}" data-answer="${option}" ${practice.solved ? 'disabled' : ''}><span class="answer-index" aria-hidden="true">${practice.solved && option === q.answer ? '✓' : i + 1}</span>${esc(t(q.key + '.a.' + option))}</button>`).join('')}</div>`;
    else if (q.type === 'locate') {
      content = renderBoard(diagramBoard(q.lesson), { interactive: true, marks: practice.hintVisible || practice.solved ? [C.index(q.to)] : [], chosen: practice.solved ? C.index(q.to) : null, coordinates: true, focusAt: C.index('a1') });
      if (!practice.solved) content += `<details class="list-controls" ${listOpen ? 'open' : ''}><summary>${esc(t('play.list'))}</summary><label>${esc(t('practice.chooseSquare'))}<select data-list-to><option value="">${esc(t('play.choose'))}</option>${Array.from({ length: 64 }, (_, at) => `<option value="${at}">${C.square(at)}</option>`).join('')}</select></label>${button('common.choose', 'list-move', 'secondary', 'disabled')}</details>`;
    } else {
      const board = diagramBoard(q.lesson);
      if (practice.solved) { board[C.index(q.to)] = board[C.index(q.from)]; board[C.index(q.from)] = null; }
      content = renderBoard(board, { interactive: true, chosen: practice.selected ? C.index(q.from) : null, marks: practice.hintVisible && !practice.solved ? [C.index(q.to)] : [], focusAt: practice.solved ? C.index(q.to) : C.index(q.from) });
      if (!practice.solved) content += listControls(board, [C.index(q.from)], Array.from({ length: 64 }, (_, i) => i).filter(i => i !== C.index(q.from)), false);
    }
    const heading = t('lesson.' + q.lesson.id + '.title');
    const controls = `<div class="actions">${practice.solved ? button('common.next', 'next-exercise') : button('practice.hint', 'exercise-hint', 'secondary')}${button('practice.lesson', 'review-lesson', 'quiet', `data-lesson="${q.lesson.id}"`)}</div>`;
    const feedback = practice.message ? `<p class="feedback ${practice.solved ? '' : 'hint'}">${practice.solved ? '✓ ' : ''}${esc(practice.message)}</p>` : '';
    const hint = practice.hintVisible && !practice.solved ? `<p class="feedback hint">${esc(t(q.key + '.hint'))}</p>` : '';
    if (q.type === 'choice') return `${breadcrumb('home', 'nav.home')}<div class="topic-heading"><h1>${esc(heading)}</h1></div><div class="lesson-layout"><section class="lesson-text"><p class="lesson-instruction">${esc(t(q.key))}</p>${content}${feedback}${hint}${controls}</section><div class="board-example">${renderBoard(diagramBoard(q.lesson), { label: 'learn.diagram' })}</div></div>`;
    return `${breadcrumb('home', 'nav.home')}<div class="topic-heading"><h1>${esc(heading)}</h1></div><div class="lesson-layout"><section class="lesson-text"><p class="lesson-instruction">${esc(t(q.key))}</p>${feedback}${hint}${controls}</section><div class="board-example">${content}</div></div>`;
  }
  function answer(correct) {
    if (practice.solved) return;
    if (correct) {
      practice.solved = true;
      const q = practice.questions[practice.at], supported = practice.hinted || practice.corrected;
      if (progress.exercises[q.id] !== 'independent') progress.exercises[q.id] = supported ? 'supported' : 'independent';
      save('progress', progress);
      practice.message = t('practice.right');
    } else { practice.corrected = true; practice.message = t('practice.again'); }
    const activeOption = document.activeElement?.dataset.answer;
    const activeSquare = document.activeElement?.dataset.square;
    render(false); announce(practice.message);
    if (correct) sound.play('success');
    if (correct) main.querySelector('[data-action="next-exercise"]').focus();
    else if (activeOption !== undefined) main.querySelector(`[data-answer="${activeOption}"]`)?.focus();
    else if (activeSquare !== undefined) main.querySelector(`[data-square="${activeSquare}"]`)?.focus();
  }
  function renderPracticeDone() {
    return `<section class="complete"><div class="complete-icon" aria-hidden="true">✓</div><h1>${esc(t('practice.complete'))}</h1><div class="actions">${link('practice.toGame', 'play')}${button('practice.repeat', 'repeat-exercise', 'secondary')}${link('learn.other', 'learn', 'quiet')}</div></section>`;
  }
  function miniBanner() {
    return `<section class="mini-banner"><span class="mini-banner-icon" aria-hidden="true">⚑</span><div><h2>${esc(t('mini.title'))}</h2></div>${link('mini.open', 'minigames')}</section>`;
  }
  function renderMinigames() {
    return `${breadcrumb('home', 'nav.home')}<div class="page-intro"><h1>${esc(t('mini.title'))}</h1><p>${esc(t('mini.summary', { n: Object.keys(progress.minigames).length, total: M.catalog.length }))}</p></div>${['arrive', 'path', 'protect'].map((group, i) => `<section class="mini-group"><div class="section-heading"><h2>${esc(t('mini.group.' + group))}</h2></div><div class="lesson-list">${M.catalog.filter(c => c.group === group).map(c => `<a class="lesson-card" href="#minigame/${c.id}"><span class="piece-icon">${pieceSvg(c.piece)}</span><div><h3>${esc(t('mini.' + c.id + '.title'))}</h3><span class="lesson-state">${esc(progress.minigames[c.id] ? '✓ ' + t('mini.completed') : t('mini.boardSize', { n: c.size }))}</span></div><span class="lesson-arrow" aria-hidden="true">→</span></a>`).join('')}</div></section>`).join('')}${link('practice.toGame', 'play', 'secondary')}`;
  }
  function startMini(id, showMoves) {
    const state = M.start(id);
    if (!state) { mini = null; return; }
    mini = { state, selected: null, history: [], hint: null, message: '', usedHelp: false, showMoves: showMoves ?? M.catalog.find(c => c.id === id).group === 'arrive' };
    practiceReturn = false; miniReturn = null;
  }
  function miniInstruction() { return mini.state.movers.length > 1 ? t('mini.selectAny') : t('mini.select', { piece: t('piece.' + mini.state.board[mini.state.movers[0]].toLowerCase()) }); }
  function renderMini(focusAt) {
    const { state } = mini, challenge = M.catalog.find(c => c.id === state.id);
    const safety = challenge.group === 'protect', target = C.index(challenge.targets[state.target]);
    const destinations = mini.selected === null ? [] : M.moves(state, mini.selected).map(m => m.to);
    const next = M.catalog[M.catalog.indexOf(challenge) + 1];
    const marks = mini.hint ? [mini.hint.to] : mini.showMoves ? destinations : [];
    const last = mini.history.at(-1), lastSquares = last ? state.board.map((p, i) => p !== last.board[i] ? i : -1).filter(i => i >= 0) : [];
    const goal = safety ? t('mini.safeGoal') : t(state.board[target] ? 'mini.captureGoal' : 'mini.goal', { square: C.square(target) });
    const hint = mini.hint ? t('play.hintText', { piece: t('piece.' + state.board[mini.hint.from].toLowerCase()), from: C.square(mini.hint.from), to: C.square(mini.hint.to) }) : '';
    return `${breadcrumb('minigames', 'mini.back')}<div class="page-intro"><p class="eyebrow">${esc(t('mini.group.' + challenge.group))} · ${esc(t('mini.boardSize', { n: challenge.size }))}</p><h1>${esc(t('mini.' + state.id + '.title'))}</h1></div><div class="mini-layout"><section class="mini-board-panel">${renderBoard(state.board, { interactive: true, size: challenge.size, chosen: mini.selected, marks, target: state.done ? -1 : target, king: safety ? state.board.indexOf('K') : -1, attacker: safety && !state.done ? C.index(challenge.attacker) : -1, movers: state.movers, focusAt: focusAt ?? state.movers[0], label: 'mini.board', last: lastSquares })}<p class="board-legend">${esc(t(safety ? 'mini.safeLegend' : 'mini.flagLegend'))}</p>${!state.done ? listControls(state.board, state.movers.filter(at => M.moves(state, at).length), destinations, false) : ''}</section><section class="mini-help"><div class="mini-goal"><h2>${esc(state.done ? t('mini.success') : goal)}</h2>${state.done ? `` : `<p class="game-instruction">${esc((mini.selected === null ? miniInstruction() : t('mini.destination')))}</p>${challenge.targets.length > 1 ? `<p>${esc(t('mini.targetCount', { n: state.target + 1, total: challenge.targets.length }))}</p>` : ''}${mini.message ? `<p class="feedback hint">${esc(mini.message)}</p>` : ''}${hint ? `<p class="feedback hint">${esc(hint)}</p>` : ''}`}</div><div class="mini-tools">${state.done ? `<div class="actions">${next ? `<a class="button" data-mini-next href="#minigame/${next.id}">${esc(t('mini.next'))}</a>` : `<a class="button" data-mini-next href="#play">${esc(t('practice.toGame'))}</a>`}${link('mini.back', 'minigames', 'secondary')}</div>` : `<label class="mini-marks"><input type="checkbox" data-mini-marks ${mini.showMoves ? 'checked' : ''}>${esc(t('mini.showMoves'))}</label>${button('practice.hint', 'mini-hint', 'secondary')}${button('practice.lesson', 'mini-lesson', 'quiet')}`}${button('play.undo', 'mini-undo', 'secondary', mini.history.length ? '' : 'disabled')}${button('mini.restart', 'mini-restart', 'quiet')}<details><summary>${esc(t('mini.rules'))}</summary><p>${esc(t(safety ? 'mini.rules.protect' : 'mini.rules.move'))}</p></details></div></section></div>`;
  }
  function refreshMini(focusAt) {
    main.innerHTML = renderMini(focusAt);
    if (focusAt !== undefined) main.querySelector(`[data-square="${focusAt}"]`)?.focus({ preventScroll: true });
  }
  function miniSquare(at) {
    if (!mini || mini.state.done) return;
    const { state } = mini;
    if (state.movers.includes(at)) {
      mini.selected = mini.selected === at ? null : at; mini.hint = null; mini.message = '';
      if (mini.showMoves && mini.selected !== null) mini.usedHelp = true;
      refreshMini(at); announce((mini.selected === null ? miniInstruction() : t('mini.destination'))); return;
    }
    const next = mini.selected === null ? null : M.play(state, mini.selected, at);
    if (!next) {
      if (mini.selected !== null) mini.usedHelp = true;
      mini.message = (mini.selected === null ? miniInstruction() : t('mini.again')); refreshMini(at); announce(mini.message); return;
    }
    mini.usedHelp ||= mini.showMoves;
    mini.history.push(state); mini.state = next; mini.selected = null; mini.hint = null;
    mini.message = t(next.target > state.target ? 'mini.nextFlag' : 'mini.moved', { square: C.square(at) });
    if (next.done) {
      if (progress.minigames[state.id] !== 'independent') progress.minigames[state.id] = mini.usedHelp ? 'supported' : 'independent';
      save('progress', progress);
    }
    refreshMini(at);
    if (next.done) main.querySelector('[data-mini-next]')?.focus();
    sound.play(next.done || next.target > state.target ? 'success' : 'move');
    announce(next.done ? t('mini.success') : mini.message);
  }
  function freshGame(mode, partner) {
    const state = C.fromFEN(mode === 'mini' ? C.MINI : C.START);
    return { mode, partner, moves: [], states: [state], keys: [C.positionKey(state)], claimed: null };
  }
  function restoreGame(saved) {
    if (!saved || !['mini', 'full'].includes(saved.mode) || !['computer', 'local'].includes(saved.partner) || !Array.isArray(saved.moves) || saved.moves.length > 2000) return null;
    const candidate = freshGame(saved.mode, saved.partner);
    for (const requested of saved.moves) {
      if (!requested || !Number.isInteger(requested.from) || !Number.isInteger(requested.to) || C.status(candidate.states.at(-1), candidate.keys).ended) return null;
      const result = C.play(candidate.states.at(-1), requested);
      if (!result) return null;
      candidate.moves.push(result.move); candidate.states.push(result.state); candidate.keys.push(C.positionKey(result.state));
    }
    const claim = C.status(candidate.states.at(-1), candidate.keys).claim;
    if (saved.claimed && saved.claimed === claim) candidate.claimed = claim;
    return candidate;
  }
  function saveGame() { save('game', { mode: game.mode, partner: game.partner, moves: game.moves.map(({ from, to, promotion }) => ({ from, to, ...(promotion ? { promotion } : {}) })), claimed: game.claimed }); }
  function renderPlay() {
    return `${breadcrumb()}<div class="page-intro"><h1>${esc(t('play.title'))}</h1>${game ? link('play.resume', 'game') : ''}</div><form id="game-setup"><fieldset><legend>${esc(t('play.boardType'))}</legend><div class="mode-grid">${['mini', 'full'].map(mode => `<label class="mode-choice"><input type="radio" name="mode" value="${mode}" ${mode === 'mini' ? 'checked' : ''}><span><strong>${esc(t('play.' + mode))}</strong><small>${esc(t('play.' + mode + 'Desc'))}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>${esc(t('play.partner'))}</legend><div class="mode-grid">${['computer', 'local'].map(partner => `<label class="mode-choice"><input type="radio" name="partner" value="${partner}" ${partner === 'computer' ? 'checked' : ''}><span><strong>${esc(t('play.' + partner))}</strong><small>${esc(t('play.' + partner + 'Desc'))}</small></span></label>`).join('')}</div></fieldset><button class="button" type="submit">${esc(t('play.start'))}${icon('arrow')}</button></form>`;
  }
  function gameStatus() { return game.claimed ? { ended: true, reason: game.claimed } : C.status(game.states.at(-1), game.keys); }
  function listControls(board, froms, destinations, isGame) {
    const from = route()[0] === 'minigame' ? mini.selected : isGame ? selected : practice.selected ? C.index(practice.questions[practice.at].from) : null;
    return `<details class="list-controls" ${listOpen ? 'open' : ''}><summary>${esc(t('play.list'))}</summary><label>${esc(t('play.from'))}<select data-list-from><option value="">${esc(t('play.choose'))}</option>${froms.map(at => `<option value="${at}" ${from === at ? 'selected' : ''}>${esc(t('piece.' + board[at].toLowerCase()))} · ${C.square(at)}</option>`).join('')}</select></label><label>${esc(t('play.to'))}<select data-list-to ${from === null ? 'disabled' : ''}><option value="">${esc(t('play.choose'))}</option>${destinations.map(at => `<option value="${at}">${C.square(at)}${board[at] ? ' · ' + esc(t('play.captureLabel')) : ''}</option>`).join('')}</select></label>${button('play.move', 'list-move', 'secondary', 'disabled')}</details>`;
  }
  function moveText(move, before) {
    if (!move) return t('play.noLastMove');
    let text = t('play.moved', { side: t('play.' + (before.turn === 'w' ? 'white' : 'black')), piece: t('piece.' + before.board[move.from].toLowerCase()), from: C.square(move.from), to: C.square(move.to) });
    if (before.board[move.to]) text += ' ' + t('play.captured', { piece: t('piece.' + before.board[move.to].toLowerCase()) });
    if (move.castle) text += ' ' + t('play.castled');
    if (move.ep) text += ' ' + t('play.enpassant');
    if (move.promotion) text += ' ' + t('play.promoted', { piece: t('piece.' + move.promotion) });
    return text;
  }
  function statusText(status) {
    return status.reason === 'mate' ? t('play.mate', { side: t('play.' + (status.winner === 'w' ? 'white' : 'black')).toLowerCase() }) : t('play.' + status.reason);
  }
  function renderGame(focusAt = selected === null ? 56 : selected) {
    const state = game.states.at(-1), status = gameStatus();
    const thinking = game.partner === 'computer' && state.turn === 'b' && !status.ended;
    const destinations = selected === null || status.ended ? [] : [...new Set(C.legalMoves(state, selected).map(m => m.to))];
    const last = game.moves.at(-1), lastText = last ? moveText(last, game.states.at(-2)) : t('play.noLastMove');
    const title = thinking ? t('play.thinking') : t('play.' + (state.turn === 'w' ? 'whiteTurn' : 'blackTurn'));
    const instruction = gameMessage || (selected === null ? t('play.select', { side: t('play.' + (state.turn === 'w' ? 'white' : 'black')).toLowerCase() }) : t('play.destination'));
    return `${breadcrumb('play', 'nav.play')}<div class="game-top"><h1>${esc(t('play.' + game.mode))}</h1><span class="turn-tag">${esc(status.ended ? t('nav.play') : title)}</span></div><div class="play-layout"><section><div class="players"><span><i class="player-dot" aria-hidden="true"></i>${esc(t('play.white'))}${game.partner === 'computer' ? ' · ' + esc(t('play.you')) : ''}</span><span><i class="player-dot black" aria-hidden="true"></i>${esc(t('play.black'))}${game.partner === 'computer' ? ' · Enroca' : ''}</span></div>${renderBoard(state.board, { interactive: true, marks: destinations, chosen: selected, last: last ? [last.from, last.to] : [], focusAt })}<p class="board-legend">${esc(t('play.legend'))}</p>${!status.ended && !thinking ? listControls(state.board, [...new Set(C.legalMoves(state).map(m => m.from))], destinations, true) : ''}</section><aside class="game-help"><div>${status.ended ? `<h2>${esc(statusText(status))}</h2>` : `<h2>${esc(title)}</h2>${status.check ? `<div class="feedback hint">${esc(t('play.check'))}</div>` : ''}<p class="game-instruction">${esc(thinking ? t('play.thinking') : instruction)}</p>`}${gameHint && !status.ended ? `<div class="feedback hint">${esc(t('play.hintText', { piece: t('piece.' + state.board[gameHint.from].toLowerCase()), from: C.square(gameHint.from), to: C.square(gameHint.to) }))}</div>` : ''}</div>${!status.ended ? button('play.hint', 'game-hint', 'secondary', thinking ? 'disabled' : '') : ''}${button('play.undo', 'undo', 'secondary', !game.moves.length ? 'disabled' : '')}${status.claim && !thinking ? `<p class="lesson-caption">${esc(t('play.claimAvailable'))}</p>${button('play.claim', 'claim', 'secondary')}` : ''}<div class="last-move"><h3>${esc(t('play.lastMove'))}</h3><p>${esc(lastText)}</p></div>${button('play.new', 'new-game', 'quiet')}<details><summary>${esc(t('play.history'))}</summary><ol class="move-log">${game.moves.map((move, i) => `<li>${esc(moveText(move, game.states[i]))}</li>`).join('')}</ol></details></aside></div>`;
  }
  function updateGame(focusAt, takeFocus = false) {
    const focusedSquare = document.activeElement?.dataset.square;
    main.innerHTML = renderGame(focusAt ?? (focusedSquare === undefined ? 56 : Number(focusedSquare)));
    if (takeFocus || focusedSquare !== undefined) main.querySelector(`[data-square="${focusAt ?? focusedSquare}"]`)?.focus({ preventScroll: true });
  }
  function commitMove(requested, human = true) {
    const before = game.states.at(-1), result = C.play(before, requested);
    if (!result || gameStatus().ended) return;
    game.moves.push(result.move); game.states.push(result.state); game.keys.push(C.positionKey(result.state));
    selected = null; gameHint = null; gameMessage = ''; saveGame();
    updateGame(result.move.to, human);
    const status = gameStatus();
    announce(moveText(result.move, before) + ' ' + (status.ended ? statusText(status) : status.check ? t('play.check') : t('play.' + (result.state.turn === 'w' ? 'whiteTurn' : 'blackTurn'))));
    sound.play('move');
    scheduleAI();
  }
  function scheduleAI() {
    clearTimeout(aiTimer); aiTimer = null;
    if (!game || route()[0] !== 'game' || game.partner !== 'computer' || game.states.at(-1).turn !== 'b' || gameStatus().ended) return;
    aiTimer = setTimeout(() => {
      aiTimer = null;
      if (route()[0] !== 'game' || dialog.open) return;
      const move = C.chooseMove(game.states.at(-1));
      if (move) commitMove(move, false);
    }, 650);
  }
  function gameSquare(at) {
    if (!game || gameStatus().ended) return;
    const state = game.states.at(-1);
    if (game.partner === 'computer' && state.turn === 'b') return;
    if (at === selected) { selected = null; gameHint = null; gameMessage = ''; updateGame(at, true); return; }
    const p = state.board[at];
    if (p && C.color(p) === state.turn) {
      selected = at; gameHint = null;
      gameMessage = C.legalMoves(state, at).length ? t('play.selected', { piece: t('piece.' + p.toLowerCase()), square: C.square(at) }) : t('play.noMoves');
      updateGame(at, true); announce(gameMessage); return;
    }
    const moves = selected === null ? [] : C.legalMoves(state, selected).filter(m => m.to === at);
    if (!moves.length) { gameMessage = selected === null ? t('play.select', { side: t('play.' + (state.turn === 'w' ? 'white' : 'black')).toLowerCase() }) : t('play.invalid'); updateGame(at, true); announce(gameMessage); return; }
    if (moves[0].promotion) {
      showDialog(`<h2 id="dialog-title">${esc(t('play.promotion'))}</h2><div class="promotion-grid">${moves.map(m => `<button type="button" data-promotion="${m.promotion}">${pieceSvg(state.turn === 'w' ? m.promotion.toUpperCase() : m.promotion)}${esc(t('piece.' + m.promotion))}</button>`).join('')}</div>${button('common.cancel', 'close-dialog', 'secondary')}`);
      dialog.querySelectorAll('[data-promotion]').forEach(el => el.addEventListener('click', () => { closeDialog(); commitMove(moves.find(m => m.promotion === el.dataset.promotion)); }));
    } else commitMove(moves[0]);
  }
  function renderSettings() {
    return `${breadcrumb()}<section class="settings-panel"><div class="page-intro"><h1>${esc(t('settings.title'))}</h1></div><label class="setting"><span>${esc(t('settings.language'))}</span><select data-setting="lang"><option value="es" ${settings.lang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${settings.lang === 'en' ? 'selected' : ''}>English</option></select></label><label class="setting"><span>${esc(t('settings.text'))}</span><select data-setting="size"><option value="regular" ${settings.size === 'regular' ? 'selected' : ''}>${esc(t('settings.regular'))}</option><option value="large" ${settings.size === 'large' ? 'selected' : ''}>${esc(t('settings.large'))}</option></select></label><label class="setting"><span>${esc(t('settings.contrast'))}</span><input type="checkbox" data-setting="contrast" ${settings.contrast ? 'checked' : ''}></label><label class="setting"><span>${esc(t('settings.pieceNames'))}</span><input type="checkbox" data-setting="names" ${settings.names ? 'checked' : ''}></label><label class="setting"><span>${esc(t('settings.sounds'))}</span><input type="checkbox" data-setting="sounds" ${settings.sounds ? 'checked' : ''}></label><div class="settings-data"><h2>${esc(t('settings.data'))}</h2>${button('settings.delete', 'delete-data', 'secondary')}</div></section>`;
  }
  function renderPrivacy() {
    return `${breadcrumb()}<section class="settings-panel"><h1>${esc(t('privacy.title'))}</h1>${['intro', 'storage', 'tracking', 'reset'].map(key => `<p>${esc(t('privacy.' + key))}</p>`).join('')}${link('nav.settings', 'settings')}</section>`;
  }
  function showDialog(html) {
    clearTimeout(aiTimer); aiTimer = null; modalReturn = document.activeElement;
    dialog.innerHTML = html; dialog.showModal();
    const cancel = dialog.querySelector('[data-action="close-dialog"]'); if (cancel) cancel.focus();
  }
  function closeDialog() {
    dialog.close();
    if (modalReturn?.isConnected) modalReturn.focus();
    modalReturn = null; scheduleAI();
  }
  function confirm(title, text, actionKey, callback, danger = false) {
    showDialog(`<h2 id="dialog-title">${esc(t(title))}</h2><p>${esc(t(text))}</p><div class="actions">${button('common.cancel', 'close-dialog', 'secondary')}<button type="button" class="button ${danger ? 'danger' : ''}" id="confirm-action">${esc(t(actionKey))}</button></div>`);
    dialog.querySelector('#confirm-action').addEventListener('click', () => { closeDialog(); callback(); });
  }
  document.addEventListener('click', event => {
    if (event.target.closest('.skip-link')) { event.preventDefault(); main.focus(); return; }
    const practiceLink = event.target.closest('[data-practice]');
    if (practiceLink) { event.preventDefault(); startPractice(practiceLink.dataset.practice); return; }
    const square = event.target.closest('[data-square]');
    if (square) {
      const at = Number(square.dataset.square);
      if (route()[0] === 'minigame') miniSquare(at);
      else if (route()[0] === 'game') gameSquare(at);
      else if (['exercise', 'lesson'].includes(route()[0]) && practice && !practice.solved) {
        const q = practice.questions[practice.at];
        if (q.type === 'locate') { answer(at === C.index(q.to)); }
        else if (at === C.index(q.from)) { practice.selected = !practice.selected; practice.message = t(practice.selected ? 'practice.chooseSquare' : 'practice.choosePiece'); render(false); main.querySelector(`[data-square="${at}"]`).focus(); announce(practice.message); }
        else if (practice.selected) answer(at === C.index(q.to));
        else { practice.message = t('practice.choosePiece'); render(false); main.querySelector(`[data-square="${at}"]`)?.focus(); announce(practice.message); }
      }
      return;
    }
    const option = event.target.closest('[data-answer]');
    if (option && practice) { answer(Number(option.dataset.answer) === practice.questions[practice.at].answer); return; }
    const control = event.target.closest('[data-action]');
    if (!control || control.disabled) return;
    const action = control.dataset.action;
    switch (action) {
      case 'list-move': {
        const target = main.querySelector('[data-list-to]');
        if (!target || target.value === '') break;
        const at = Number(target.value);
        if (route()[0] === 'minigame') miniSquare(at);
      else if (route()[0] === 'game') gameSquare(at);
        else if (practice && !practice.solved) answer(at === C.index(practice.questions[practice.at].to));
        break;
      }
      case 'mini-hint': {
        const move = M.solution(mini.state)[0];
        if (move) { mini.usedHelp = true; mini.hint = move; mini.selected = move.from; refreshMini(move.from); announce(t('play.hintText', { piece: t('piece.' + mini.state.board[move.from].toLowerCase()), from: C.square(move.from), to: C.square(move.to) })); }
        break;
      }
      case 'mini-restart': { const id = mini.state.id, show = mini.showMoves; startMini(id, show); render(); break; }
      case 'mini-undo':
        if (mini.history.length) { mini.state = mini.history.pop(); mini.selected = null; mini.hint = null; mini.message = t('mini.undone'); refreshMini(mini.state.movers[0]); announce(mini.message); }
        break;
      case 'mini-lesson':
        mini.usedHelp = true; miniReturn = M.catalog.find(c => c.id === mini.state.id).lesson; practiceReturn = false; go('lesson/' + miniReturn + '/0'); break;
      case 'example': exampleMoved = !exampleMoved; render(false); main.querySelector('[data-action="example"]').focus(); break;
      case 'finish-lesson': finishLesson(control.dataset.lesson); break;
      case 'exercise-hint': practice.hinted = true; practice.hintVisible = true; render(false); main.querySelector('[data-action="exercise-hint"]').focus(); announce(t(practice.questions[practice.at].key + '.hint')); break;
      case 'review-lesson': practice.hinted = true; practiceReturn = true; go('lesson/' + control.dataset.lesson + '/0'); break;
      case 'return-exercise': practiceReturn = false; go(practice.topicId ? 'lesson/' + practice.topicId + '/' + (lessons.find(l => l.id === practice.topicId).steps + practice.at) : 'exercise/' + practice.id); break;
      case 'next-exercise': {
        const topicId = practice.topicId, lesson = lessons.find(l => l.id === topicId);
        practice.at++; Object.assign(practice, { hinted: false, corrected: false, solved: false, selected: false, hintVisible: false, message: '' });
        if (topicId) {
          if (practice.at >= practice.questions.length && !progress.lessons.includes(topicId)) { progress.lessons.push(topicId); save('progress', progress); }
          go('lesson/' + topicId + '/' + (lesson.steps + practice.at));
        } else if (practice.at >= practice.questions.length) go('practice-done'); else render();
        break;
      }
      case 'repeat-exercise': startPractice(practice ? practice.id : 'all'); break;
      case 'game-hint': {
        const state = game.states.at(-1); gameHint = C.chooseMove(state);
        if (gameHint) { selected = gameHint.from; gameMessage = ''; updateGame(gameHint.from, true); announce(t('play.hintText', { piece: t('piece.' + state.board[gameHint.from].toLowerCase()), from: C.square(gameHint.from), to: C.square(gameHint.to) })); }
        break;
      }
      case 'undo': {
        clearTimeout(aiTimer); aiTimer = null;
        // Undo both plies against Enroca; undo the pending human ply on its own.
        const plies = game.partner === 'computer' && game.states.at(-1).turn === 'w' ? Math.min(2, game.moves.length) : 1;
        game.moves.splice(-plies); game.states.splice(-plies); game.keys.splice(-plies); game.claimed = null;
        selected = null; gameHint = null; gameMessage = ''; saveGame(); updateGame(56, true); announce(t('play.' + (game.states.at(-1).turn === 'w' ? 'whiteTurn' : 'blackTurn'))); break;
      }
      case 'new-game': go('play'); break;
      case 'claim': {
        const claim = gameStatus().claim;
        if (claim) { game.claimed = claim; saveGame(); updateGame(); announce(statusText(gameStatus())); } break;
      }
      case 'close-dialog': closeDialog(); break;
      case 'delete-data': confirm('settings.confirmTitle', 'settings.confirmText', 'settings.confirm', () => {
        if (!storage.reset()) { syncNotices(); announce(t('common.storageUnavailable')); return; }
        window.Ludia.reset();
        clearTimeout(aiTimer); mini = null; miniReturn = null; game = null; practice = null; practiceReturn = false; selected = null; gameHint = null; gameMessage = '';
        progress = { lessons: [], exercises: {}, minigames: {} }; settings = { ...defaults }; applySettings(); render(); announce(t('settings.deleted'));
      }, true); break;
    }
  });
  document.addEventListener('toggle', event => {
    if (event.target.matches('.list-controls') && event.target.isConnected) listOpen = event.target.open;
  }, true);
  document.addEventListener('change', event => {
    if (event.target.matches('[data-mini-marks]')) {
      mini.showMoves = event.target.checked; if (mini.showMoves) mini.usedHelp = true;
      refreshMini(); main.querySelector('[data-mini-marks]')?.focus(); return;
    }
    if (event.target.matches('[data-list-from]')) {
      if (event.target.value === '') return;
      const at = Number(event.target.value);
      if (route()[0] === 'minigame') miniSquare(at);
      else if (route()[0] === 'game') gameSquare(at);
      else if (practice) { practice.selected = true; render(false); }
      const destination = main.querySelector('[data-list-to]'); if (destination) destination.focus();
      return;
    }
    if (event.target.matches('[data-list-to]')) {
      main.querySelector('[data-action="list-move"]').disabled = event.target.value === ''; return;
    }
    const control = event.target.closest('[data-setting]'); if (!control) return;
    settings[control.dataset.setting] = control.type === 'checkbox' ? control.checked : control.value;
    if (control.dataset.setting === 'lang') {
      const url = new URL(location.href); url.searchParams.set('lang', settings.lang); history.replaceState(null, '', url);
    }
    save('settings', settings); render(false); if (settings.sounds && control.dataset.setting === 'sounds') sound.play('success'); main.querySelector(`[data-setting="${control.dataset.setting}"]`)?.focus();
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'game-setup') return; event.preventDefault();
    const form = new FormData(event.target);
    const start = () => { game = freshGame(form.get('mode'), form.get('partner')); selected = null; gameHint = null; gameMessage = ''; saveGame(); go('game'); };
    if (game && game.moves.length) confirm('play.newTitle', 'play.newText', 'play.start', start); else start();
  });
  document.addEventListener('keydown', event => {
    const square = event.target.closest('[data-square]'); if (!square) return;
    const at = Number(square.dataset.square), size = Number(square.closest('[data-board-size]').dataset.boardSize);
    const visible = M.squares(size), position = visible.indexOf(at), row = Math.floor(position / size), col = position % size;
    const nextPosition = { ArrowUp: Math.max(0, row - 1) * size + col, ArrowDown: Math.min(size - 1, row + 1) * size + col, ArrowLeft: row * size + Math.max(0, col - 1), ArrowRight: row * size + Math.min(size - 1, col + 1), Home: event.ctrlKey ? 0 : row * size, End: event.ctrlKey ? size * size - 1 : row * size + size - 1 }[event.key];
    const next = visible[nextPosition];
    if (next !== undefined) { event.preventDefault(); main.querySelectorAll('[data-square]').forEach(el => { el.tabIndex = -1; }); const dest = main.querySelector(`[data-square="${next}"]`); dest.tabIndex = 0; dest.focus(); }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (route()[0] === 'minigame') { mini.selected = null; mini.hint = null; refreshMini(at); }
      else if (route()[0] === 'game') { selected = null; gameHint = null; gameMessage = ''; updateGame(at, true); }
      else if (practice) { practice.selected = false; render(false); main.querySelector(`[data-square="${at}"]`)?.focus(); }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  window.addEventListener('hashchange', () => { if (dialog.open) closeDialog(); exampleMoved = false; listOpen = false; render(); });
  window.addEventListener('offline', syncNotices); window.addEventListener('online', syncNotices);
  window.addEventListener('pagehide', () => { clearTimeout(aiTimer); sound.stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(aiTimer); sound.stop(); } else scheduleAI(); });
  applySettings(); render(false);
  if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
    navigator.serviceWorker.register('./sw-v10.js').then(registration => registration.update()).catch(() => { /* Direct file use and unavailable SW do not prevent play. */ });
  }
}());
