/* Enroca chess rules. No browser, network or storage dependencies. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EnrocaChess = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const MINI = '4k3/3ppp2/8/8/8/8/3PPP2/4K2R w - - 0 1';
  const orthogonal = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const diagonal = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  const jumps = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  const opposite = c => c === 'w' ? 'b' : 'w';
  const color = p => !p ? null : p === p.toUpperCase() ? 'w' : 'b';
  const square = i => 'abcdefgh'[i % 8] + (8 - Math.floor(i / 8));
  const index = s => typeof s === 'string' && /^[a-h][1-8]$/.test(s) ? (8 - Number(s[1])) * 8 + 'abcdefgh'.indexOf(s[0]) : -1;
  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  function fromFEN(fen) {
    const fields = fen.trim().split(/\s+/);
    const rows = fields[0].split('/');
    if (rows.length !== 8 || !/^[wb]$/.test(fields[1])) throw new Error('Invalid FEN');
    const board = [];
    for (const row of rows) {
      const rank = [];
      for (const p of row) {
        if (/[1-8]/.test(p)) rank.push(...Array(Number(p)).fill(null));
        else if (/[prnbqkPRNBQK]/.test(p)) rank.push(p);
        else throw new Error('Invalid piece');
      }
      if (rank.length !== 8) throw new Error('Invalid rank');
      board.push(...rank);
    }
    return { board, turn: fields[1], castling: fields[2] === '-' ? '' : fields[2], ep: index(fields[3]), halfmove: Number(fields[4] || 0), fullmove: Number(fields[5] || 1) };
  }
  function toFEN(s) {
    const ranks = [];
    for (let r = 0; r < 8; r++) {
      let rank = '', empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = s.board[r * 8 + c];
        if (!p) empty++;
        else { if (empty) rank += empty; empty = 0; rank += p; }
      }
      if (empty) rank += empty;
      ranks.push(rank);
    }
    return `${ranks.join('/')} ${s.turn} ${s.castling || '-'} ${s.ep < 0 ? '-' : square(s.ep)} ${s.halfmove} ${s.fullmove}`;
  }
  function attacked(s, at, by) {
    const row = Math.floor(at / 8), col = at % 8;
    const piece = type => by === 'w' ? type.toUpperCase() : type;
    const pawnRow = row + (by === 'w' ? 1 : -1);
    for (const dc of [-1, 1]) if (inside(pawnRow, col + dc) && s.board[pawnRow * 8 + col + dc] === piece('p')) return true;
    for (const [dr, dc] of jumps) if (inside(row + dr, col + dc) && s.board[(row + dr) * 8 + col + dc] === piece('n')) return true;
    for (const [dr, dc] of [...orthogonal, ...diagonal]) {
      let r = row + dr, c = col + dc, distance = 1;
      while (inside(r, c)) {
        const p = s.board[r * 8 + c];
        if (p) {
          if (color(p) === by && (p.toLowerCase() === 'q' || (distance === 1 && p.toLowerCase() === 'k') ||
            (p.toLowerCase() === 'r' && (dr === 0 || dc === 0)) || (p.toLowerCase() === 'b' && dr !== 0 && dc !== 0))) return true;
          break;
        }
        r += dr; c += dc; distance++;
      }
    }
    return false;
  }
  function inCheck(s, side = s.turn) {
    const king = s.board.indexOf(side === 'w' ? 'K' : 'k');
    return king < 0 || attacked(s, king, opposite(side));
  }
  function pseudoMoves(s, onlyFrom) {
    const moves = [];
    function add(from, to, extra = {}) {
      const p = s.board[from];
      if (s.board[to] && (color(s.board[to]) === s.turn || s.board[to].toLowerCase() === 'k')) return;
      if (p.toLowerCase() === 'p' && (to < 8 || to >= 56)) {
        for (const promotion of ['q', 'r', 'b', 'n']) moves.push({ from, to, promotion, ...extra });
      } else moves.push({ from, to, ...extra });
    }
    for (let from = 0; from < 64; from++) {
      const p = s.board[from];
      if (!p || color(p) !== s.turn || (onlyFrom !== undefined && onlyFrom !== from)) continue;
      const type = p.toLowerCase(), row = Math.floor(from / 8), col = from % 8;
      if (type === 'p') {
        const step = s.turn === 'w' ? -1 : 1;
        const forward = from + step * 8;
        if (inside(row + step, col) && !s.board[forward]) {
          add(from, forward);
          if (row === (s.turn === 'w' ? 6 : 1) && !s.board[from + step * 16]) add(from, from + step * 16, { double: true });
        }
        for (const dc of [-1, 1]) {
          if (!inside(row + step, col + dc)) continue;
          const to = forward + dc;
          if (s.board[to] && color(s.board[to]) !== s.turn) add(from, to);
          else if (to === s.ep && !s.board[to] && s.board[to - step * 8] === (s.turn === 'w' ? 'p' : 'P')) add(from, to, { ep: true });
        }
      } else if (type === 'n' || type === 'k') {
        for (const [dr, dc] of type === 'n' ? jumps : [...orthogonal, ...diagonal]) {
          if (inside(row + dr, col + dc)) add(from, (row + dr) * 8 + col + dc);
        }
        if (type === 'k' && from === (s.turn === 'w' ? 60 : 4) && !inCheck(s)) {
          const rook = s.turn === 'w' ? 'R' : 'r';
          for (const side of [1, -1]) {
            const right = s.turn === 'w' ? (side === 1 ? 'K' : 'Q') : (side === 1 ? 'k' : 'q');
            const rookAt = from + (side === 1 ? 3 : -4);
            const clear = side === 1 ? [1, 2] : [-1, -2, -3];
            if (s.castling.includes(right) && s.board[rookAt] === rook && clear.every(d => !s.board[from + d]) &&
                !attacked(s, from + side, opposite(s.turn)) && !attacked(s, from + side * 2, opposite(s.turn))) {
              add(from, from + side * 2, { castle: side === 1 ? 'king' : 'queen' });
            }
          }
        }
      } else {
        const dirs = type === 'b' ? diagonal : type === 'r' ? orthogonal : [...orthogonal, ...diagonal];
        for (const [dr, dc] of dirs) {
          let r = row + dr, c = col + dc;
          while (inside(r, c)) {
            const to = r * 8 + c;
            add(from, to);
            if (s.board[to]) break;
            r += dr; c += dc;
          }
        }
      }
    }
    return moves;
  }
  // Internal transition. Call play() at untrusted/UI boundaries.
  function apply(s, m) {
    const next = { ...s, board: s.board.slice(), ep: -1 };
    const p = s.board[m.from], captured = s.board[m.to];
    next.board[m.from] = null;
    next.board[m.to] = m.promotion ? (s.turn === 'w' ? m.promotion.toUpperCase() : m.promotion) : p;
    if (m.ep) next.board[m.to + (s.turn === 'w' ? 8 : -8)] = null;
    if (m.castle) {
      const rookFrom = m.from + (m.castle === 'king' ? 3 : -4);
      const rookTo = m.from + (m.castle === 'king' ? 1 : -1);
      next.board[rookTo] = next.board[rookFrom]; next.board[rookFrom] = null;
    }
    if (p.toLowerCase() === 'k') next.castling = next.castling.replace(s.turn === 'w' ? /[KQ]/g : /[kq]/g, '');
    for (const [at, right] of [[0, 'q'], [7, 'k'], [56, 'Q'], [63, 'K']]) {
      if (m.from === at || m.to === at) next.castling = next.castling.replace(right, '');
    }
    if (m.double) next.ep = (m.from + m.to) / 2;
    next.halfmove = p.toLowerCase() === 'p' || captured || m.ep ? 0 : s.halfmove + 1;
    next.fullmove = s.fullmove + (s.turn === 'b' ? 1 : 0);
    next.turn = opposite(s.turn);
    return next;
  }
  function legalMoves(s, from) { return pseudoMoves(s, from).filter(m => !inCheck(apply(s, m), s.turn)); }
  function play(s, requested) {
    const move = legalMoves(s, requested.from).find(m => m.from === requested.from && m.to === requested.to && m.promotion === requested.promotion);
    if (!move) return null;
    return { state: apply(s, move), move };
  }
  function positionKey(s) {
    const fields = toFEN(s).split(' ');
    // En passant matters for repetition only if a legal capture is possible.
    if (s.ep >= 0 && !legalMoves(s).some(m => m.ep)) fields[3] = '-';
    return fields.slice(0, 4).join(' ');
  }
  function insufficient(s) {
    const pieces = s.board.map((p, i) => ({ p, i })).filter(x => x.p && x.p.toLowerCase() !== 'k');
    if (!pieces.length) return true;
    if (pieces.length === 1 && /[bn]/i.test(pieces[0].p)) return true;
    return pieces.every(x => x.p.toLowerCase() === 'b') && new Set(pieces.map(x => (Math.floor(x.i / 8) + x.i % 8) % 2)).size === 1;
  }
  function status(s, keys = []) {
    const moves = legalMoves(s), check = inCheck(s);
    if (!moves.length) return { ended: true, reason: check ? 'mate' : 'stalemate', winner: check ? opposite(s.turn) : null, check };
    if (insufficient(s)) return { ended: true, reason: 'material', check };
    const repeats = keys.filter(k => k === positionKey(s)).length;
    if (s.halfmove >= 150 || repeats >= 5) return { ended: true, reason: s.halfmove >= 150 ? 'seventyfive' : 'fivefold', check };
    return { ended: false, check, claim: s.halfmove >= 100 ? 'fifty' : repeats >= 3 ? 'threefold' : null };
  }
  function chooseMove(s) {
    const values = { p: 100, n: 300, b: 310, r: 500, q: 900, k: 0 };
    const moves = legalMoves(s);
    let best = null, bestScore = -Infinity;
    for (const m of moves) {
      const next = apply(s, m), result = status(next);
      let score = m.ep ? 100 : s.board[m.to] ? values[s.board[m.to].toLowerCase()] : 0;
      if (m.promotion) score += values[m.promotion] - 100;
      if (attacked(next, m.to, next.turn)) score -= values[next.board[m.to].toLowerCase()] * 0.85;
      if (m.castle) score += 35;
      score += 3.5 - Math.abs(m.to % 8 - 3.5);
      if (result.reason === 'mate') score += 100000;
      // Deterministic shallow opponent: modest challenge and reproducible hints.
      if (score > bestScore) { bestScore = score; best = m; }
    }
    return best;
  }
  return { START, MINI, fromFEN, toFEN, square, index, color, opposite, attacked, inCheck, legalMoves, apply, play, positionKey, status, chooseMove };
}));
