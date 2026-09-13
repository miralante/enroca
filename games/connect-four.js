(function (root) {
  'use strict';
  const G = typeof module === 'object' && module.exports ? require('./shared.js') : root.LudiaGames;
  const status = s => G.lineResult(s.board, 6, 7, 4);
  const actions = s => status(s).ended ? [] : [3, 2, 4, 1, 5, 0, 6].filter(col => !s.board[col]).map(col => ({ col }));
  function move(s, a) {
    if (!a || !Number.isInteger(a.col) || a.col < 0 || a.col > 6 || s.board[a.col] || status(s).ended) return null;
    const n = G.copy(s); let at = 35 + a.col; while (n.board[at]) at -= 7;
    n.board[at] = s.turn; n.last = at; n.turn = 3 - s.turn; return n;
  }
  function evaluate(s, side) {
    let total = 0;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = Array.from({ length: 4 }, (_, k) => [r + k * dr, c + k * dc]);
      if (!cells.every(([y, x]) => y < 6 && x >= 0 && x < 7)) continue;
      const values = cells.map(([y, x]) => s.board[y * 7 + x]);
      const mine = values.filter(v => v === side).length, theirs = values.filter(v => v === 3 - side).length;
      if (!theirs) total += [0, 1, 8, 55, 100000][mine];
      if (!mine) total -= [0, 1, 9, 65, 100000][theirs];
    }
    return total;
  }
  function search(s, side, depth, alpha, beta) {
    const end = status(s); if (end.ended) return end.winner ? (end.winner === side ? 1 : -1) * (100000 + depth) : 0;
    if (!depth) return evaluate(s, side);
    let best = s.turn === side ? -Infinity : Infinity;
    for (const a of actions(s)) {
      const v = search(move(s, a), side, depth - 1, alpha, beta);
      if (s.turn === side) { best = Math.max(best, v); alpha = Math.max(alpha, best); }
      else { best = Math.min(best, v); beta = Math.min(beta, best); }
      if (beta <= alpha) break;
    }
    return best;
  }
  function hint(s) {
    let best = null, value = -Infinity;
    for (const a of actions(s)) { const v = search(move(s, a), s.turn, 3, -Infinity, Infinity); if (v > value) { best = a; value = v; } }
    return best;
  }
  const game = G.register({ id: 'connect-four', icon: '●', color: 'blue', players: true, init: () => ({ board: Array(42).fill(0), turn: 1, last: -1 }), move, status, actions, hint });
  if (typeof module === 'object' && module.exports) module.exports = game;
}(typeof window === 'undefined' ? globalThis : window));
