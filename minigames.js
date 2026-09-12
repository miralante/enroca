/* Small training situations. No turns in movement games; real check rules in king games. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./chess.js'));
  else root.EnrocaMini = factory(root.EnrocaChess);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  const catalog = [
    { id: 'rook-flag', group: 'arrive', size: 4, lesson: 'rook', piece: 'R', pos: { a1: 'R' }, movers: ['a1'], targets: ['a4'] },
    { id: 'bishop-flag', group: 'arrive', size: 4, lesson: 'bishop', piece: 'B', pos: { a1: 'B' }, movers: ['a1'], targets: ['d4'] },
    { id: 'knight-flag', group: 'arrive', size: 4, lesson: 'knight', piece: 'N', pos: { b1: 'N', b2: 'P' }, movers: ['b1'], targets: ['c3'] },
    { id: 'pawn-flag', group: 'arrive', size: 4, lesson: 'pawn', piece: 'P', pos: { b2: 'P' }, movers: ['b2'], targets: ['b4'] },
    { id: 'rook-path', group: 'path', size: 6, lesson: 'rook', piece: 'R', pos: { a1: 'R', a3: 'P' }, movers: ['a1'], targets: ['f1', 'f6'] },
    { id: 'bishop-path', group: 'path', size: 6, lesson: 'bishop', piece: 'B', pos: { a1: 'B', d4: 'P' }, movers: ['a1'], targets: ['f4'] },
    { id: 'knight-path', group: 'path', size: 6, lesson: 'knight', piece: 'N', pos: { b1: 'N', b2: 'P' }, movers: ['b1'], targets: ['e6'] },
    { id: 'pawn-capture', group: 'path', size: 6, lesson: 'capture', piece: 'P', pos: { b2: 'P', b3: 'P', c3: 'p' }, movers: ['b2'], targets: ['c3', 'c4'] },
    { id: 'king-step', group: 'protect', size: 8, lesson: 'check', piece: 'K', pos: { e1: 'K', e8: 'r', h8: 'k' }, movers: ['e1'], targets: [], attacker: 'e8' },
    { id: 'rook-shield', group: 'protect', size: 8, lesson: 'check', piece: 'R', pos: { e1: 'K', a2: 'R', e8: 'r', h8: 'k' }, movers: ['a2'], targets: [], attacker: 'e8' },
    { id: 'bishop-capture', group: 'protect', size: 8, lesson: 'capture', piece: 'B', pos: { e1: 'K', d2: 'B', e3: 'r', h8: 'k' }, movers: ['d2'], targets: [], attacker: 'e3' },
    { id: 'choose-safety', group: 'protect', size: 8, lesson: 'check', piece: 'K', pos: { e1: 'K', a2: 'R', d2: 'B', e8: 'r', h8: 'k' }, movers: ['e1', 'a2', 'd2'], targets: [], attacker: 'e8' }
  ];
  function squares(size) {
    const result = [];
    for (let r = 8 - size; r < 8; r++) for (let c = 0; c < size; c++) result.push(r * 8 + c);
    return result;
  }
  function start(id) {
    const challenge = catalog.find(item => item.id === id);
    if (!challenge) return null;
    const board = Array(64).fill(null);
    for (const [square, piece] of Object.entries(challenge.pos)) board[C.index(square)] = piece;
    return { id, board, movers: challenge.movers.map(C.index), target: 0, done: false };
  }
  const chessState = state => ({ board: state.board, turn: 'w', castling: '', ep: -1, halfmove: 0, fullmove: 1 });
  function moves(state, from) {
    if (!state || state.done || !state.movers.includes(from)) return [];
    const challenge = catalog.find(item => item.id === state.id);
    if (challenge.group === 'protect') return C.legalMoves(chessState(state), from);
    const p = state.board[from], r = Math.floor(from / 8), c = from % 8;
    return squares(challenge.size).filter(to => {
      if (to === from || C.color(state.board[to]) === 'w') return false;
      const dr = Math.floor(to / 8) - r, dc = to % 8 - c;
      if (p === 'N') return Math.abs(dr * dc) === 2;
      if (p === 'P') {
        if (dc === 0) return !state.board[to] && (dr === -1 || (r === 6 && dr === -2 && !state.board[from - 8]));
        return dr === -1 && Math.abs(dc) === 1 && C.color(state.board[to]) === 'b';
      }
      if (!(p === 'R' && (dr === 0 || dc === 0)) && !(p === 'B' && Math.abs(dr) === Math.abs(dc))) return false;
      const step = Math.sign(dr) * 8 + Math.sign(dc);
      for (let at = from + step; at !== to; at += step) if (state.board[at]) return false;
      return true;
    }).map(to => ({ from, to }));
  }
  function play(state, from, to) {
    const move = moves(state, from).find(item => item.to === to);
    if (!move) return null;
    const challenge = catalog.find(item => item.id === state.id);
    const board = state.board.slice(); board[to] = board[from]; board[from] = null;
    const next = { ...state, board, movers: state.movers.map(at => at === from ? to : at) };
    if (challenge.group === 'protect') next.done = !C.inCheck(chessState(next), 'w');
    else {
      if (to === C.index(challenge.targets[state.target])) next.target++;
      next.done = next.target === challenge.targets.length;
    }
    return next;
  }
  // Breadth-first guidance works from the learner's current position, not a fixed answer.
  function solution(state) {
    if (!state || state.done) return [];
    const queue = [{ state, path: [] }], seen = new Set();
    const key = s => s.board.map(p => p || '.').join('') + ':' + s.target + ':' + s.movers.join(',');
    seen.add(key(state));
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      for (const from of current.state.movers) for (const move of moves(current.state, from)) {
        const next = play(current.state, from, move.to), path = [...current.path, move];
        if (next.done) return path;
        const id = key(next);
        if (!seen.has(id)) { seen.add(id); queue.push({ state: next, path }); }
      }
    }
    return [];
  }
  return { catalog, squares, start, moves, play, solution };
}));
