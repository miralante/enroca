/* Achievements: catalog, unlock logic and badge grid for the "About the app" view (#about).
   Unlocked achievements are stored as { id: timestamp } under the 'enroca:achievements' key.
   Most achievements are derived from progress the app already saves ('enroca:progress' for
   chess and 'enroca:ludia-progress' for the other games), so sync() gives existing players
   credit retroactively. The streak and wins are noticed at runtime by app.js and ludia.js. */
(function () {
  'use strict';
  const { storage, i18n } = window.App;
  const KEY = 'achievements';
  const SOLVED = ['independent', 'supported'];
  const LIST = [
    { id: 'firstExercise', icon: '⭐' },
    { id: 'tenExercises', icon: '🌟' },
    { id: 'streak3', icon: '🔥' },
    { id: 'allGames', icon: '🎓' },
    { id: 'completeGame', icon: '💯' },
    { id: 'champion', icon: '🏆' }
  ];
  let streak = 0;
  const isObject = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /** Unlocked achievements as { id: timestamp }. */
  function unlocked() {
    const saved = storage.read(KEY, {});
    return isObject(saved) ? saved : {};
  }

  /** Idempotent unlock. Returns true only the first time. */
  function achieve(id) {
    if (!LIST.some(a => a.id === id)) return false;
    const done = unlocked();
    if (done[id]) return false;
    done[id] = Date.now();
    storage.write(KEY, done);
    return true;
  }

  /** Derives achievements from saved progress. Safe to call often. */
  function sync() {
    const chess = storage.read('progress', {}), games = storage.read('ludia-progress', {});
    const chessSolved = map => isObject(map) ? Object.values(map).filter(v => SOLVED.includes(v)).length : 0;
    let total = isObject(chess) ? chessSolved(chess.exercises) + chessSolved(chess.minigames) : 0;
    if (isObject(games)) for (const entry of Object.values(games)) if (isObject(entry) && Array.isArray(entry.exercises)) total += entry.exercises.length;
    if (total >= 1) achieve('firstExercise');
    if (total >= 10) achieve('tenExercises');
    const catalog = (window.LudiaGames?.catalog || []).filter(g => g.lessons).map(g => g.id).concat('chess');
    if (isObject(games) && catalog.length > 1 && catalog.every(id => Array.isArray(games[id]?.matches) && games[id].matches.includes('finished'))) achieve('allGames');
    const chessExercises = (window.EnrocaLessons || []).flatMap(l => l.exercises);
    const chessDone = chessExercises.length && isObject(chess) && isObject(chess.exercises) && chessExercises.every(q => SOLVED.includes(chess.exercises[q.id]));
    const gameDone = (window.LudiaGames?.catalog || []).some(g => g.lessons && Array.isArray(games?.[g.id]?.exercises) && g.lessons.every(l => games[g.id].exercises.includes(l.id)));
    if (chessDone || gameDone) achieve('completeGame');
  }

  /** Records a solved exercise. `firstTry` means no wrong attempt before the right
      answer. Hints never break the streak: support stays optional and unlabelled. */
  function solved(firstTry) {
    streak = firstTry ? streak + 1 : 0;
    if (streak >= 3) achieve('streak3');
    sync();
  }

  /** Records a wrong attempt: the streak starts again. */
  function missed() { streak = 0; }

  /** Forgets runtime counters (used after "Delete data"). */
  function reset() { streak = 0; }

  /** Badge grid as an HTML string (list items). */
  function html() {
    const done = unlocked();
    return LIST.map(a => {
      const on = !!done[a.id];
      const date = on ? new Date(done[a.id]).toLocaleDateString(i18n.locale) : '';
      return `<li class="achievement-badge ${on ? 'unlocked' : 'locked'}"><span class="achievement-badge-icon" aria-hidden="true">${a.icon}</span><span class="achievement-badge-name">${esc(i18n.t('achievement.' + a.id))}</span><span class="achievement-badge-desc">${esc(i18n.t('achievement.' + a.id + '.desc'))}</span><span class="achievement-badge-status">${esc(on ? i18n.t('achievement.unlockedAt', { date }) : i18n.t('achievement.locked'))}</span></li>`;
    }).join('');
  }

  /** Draws the badges inside `container` (a <ul>). */
  function render(container) { if (container) container.innerHTML = html(); }

  /** Number of unlocked achievements in the catalog. */
  function count() { const done = unlocked(); return LIST.filter(a => done[a.id]).length; }

  window.App.achievements = { list: LIST, unlocked, achieve, sync, solved, missed, reset, html, render, count };
}());
