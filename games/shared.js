/* Ludia's dependency-free game registry. Engines are pure and work in Node too. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LudiaGames = api;
}(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const catalog = [];
  const copy = value => JSON.parse(JSON.stringify(value));
  function random(seed) { let x = seed >>> 0; return () => { x += 0x6D2B79F5; let t = Math.imul(x ^ x >>> 15, 1 | x); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(items, rng) { const result = items.slice(); for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
  function register(game) {
    if (!/^[a-z][a-z-]+$/.test(game.id) || catalog.some(g => g.id === game.id)) throw new Error('Invalid or duplicate game');
    catalog.push(game); return game;
  }
  function lineResult(board, rows, cols, length) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const side = board[r * cols + c]; if (!side) continue;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const cells = Array.from({ length }, (_, k) => [r + dr * k, c + dc * k]);
        if (cells.every(([y, x]) => y >= 0 && y < rows && x >= 0 && x < cols && board[y * cols + x] === side)) return { ended: true, winner: side, line: cells.map(([y, x]) => y * cols + x) };
      }
    }
    return { ended: board.every(Boolean), winner: 0, line: [] };
  }
  return { catalog, register, get: id => catalog.find(g => g.id === id), copy, random, shuffle, lineResult };
}));
