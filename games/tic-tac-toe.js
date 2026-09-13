(function (root) {
  'use strict';
  const G = typeof module === 'object' && module.exports ? require('./shared.js') : root.LudiaGames;
  const status = s => G.lineResult(s.board, 3, 3, 3);
  const actions = s => status(s).ended ? [] : s.board.flatMap((p, i) => p ? [] : [{ at: i }]);
  function move(s, a) {
    if (!a || !Number.isInteger(a.at) || a.at < 0 || a.at > 8 || s.board[a.at] || status(s).ended) return null;
    const n = G.copy(s); n.board[a.at] = s.turn; n.turn = 3 - s.turn; return n;
  }
  const memo = new Map();
  function score(s, side) {
    const key = s.board.join('') + s.turn + side;
    if (memo.has(key)) return memo.get(key);
    const end = status(s); if (end.ended) return end.winner ? (end.winner === side ? 1 : -1) * (10 + s.board.filter(p => !p).length) : 0;
    const values = actions(s).map(a => score(move(s, a), side));
    const value = s.turn === side ? Math.max(...values) : Math.min(...values);
    memo.set(key, value); return value;
  }
  function hint(s) { return actions(s).sort((a, b) => score(move(s, b), s.turn) - score(move(s, a), s.turn) || ([4, 0, 2, 6, 8, 1, 3, 5, 7].indexOf(a.at) - [4, 0, 2, 6, 8, 1, 3, 5, 7].indexOf(b.at)))[0] || null; }
  const game = G.register({ id: 'tic-tac-toe', icon: '✕', color: 'peach', players: true, init: () => ({ board: Array(9).fill(0), turn: 1 }), move, status, actions, hint });
  if (typeof module === 'object' && module.exports) module.exports = game;
}(typeof window === 'undefined' ? globalThis : window));
