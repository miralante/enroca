'use strict';
const assert = require('node:assert/strict');
const M = require('../minigames.js'), C = require('../chess.js');
const at = C.index;
const destinations = (state, square) => M.moves(state, at(square)).map(m => C.square(m.to));
const chess = state => ({ board: state.board, turn: 'w', castling: '', ep: -1, halfmove: 0, fullmove: 1 });
let positions = 0;
assert.equal(M.start('missing'), null);
assert.equal(M.catalog.length, 12);
for (const size of [4, 6, 8]) {
  const squares = M.squares(size);
  assert.equal(squares.length, size * size);
  assert.equal(squares.at(-size), at('a1'));
  assert.equal(squares.at(-1), at('abcdefgh'[size - 1] + '1'));
}
for (const challenge of M.catalog) {
  const start = M.start(challenge.id), before = JSON.stringify(start), allowed = M.squares(challenge.size);
  if (challenge.group === 'protect') {
    assert.equal(C.inCheck(chess(start), 'w'), true, challenge.id + ': starts in check');
    assert.equal(C.inCheck(chess(start), 'b'), false, challenge.id + ': legal opposing king');
  }
  // Every reachable training position must still have a solution, including detours.
  const queue = [start], seen = new Set();
  const key = s => s.board.map(p => p || '.').join('') + ':' + s.target;
  seen.add(key(start));
  for (let i = 0; i < queue.length; i++) {
    const state = queue[i]; positions++;
    if (state.done) {
      assert.deepEqual(M.solution(state), []);
      for (const from of state.movers) assert.deepEqual(M.moves(state, from), []);
      continue;
    }
    const route = M.solution(state);
    assert.ok(route.length, challenge.id + ': solvable after exploration');
    let solved = state;
    for (const move of route) solved = M.play(solved, move.from, move.to);
    assert.equal(solved.done, true);
    for (const from of state.movers) for (const move of M.moves(state, from)) {
      assert.ok(allowed.includes(move.from) && allowed.includes(move.to), 'never outside the visible board');
      const next = M.play(state, from, move.to);
      assert.ok(next);
      assert.equal(next.board[from], null);
      if (challenge.group === 'protect') assert.equal(C.inCheck(chess(next), 'w'), false);
      if (!seen.has(key(next))) { seen.add(key(next)); queue.push(next); }
    }
    assert.equal(M.play(state, state.movers[0], state.movers[0]), null);
  }
  assert.equal(JSON.stringify(start), before, 'guidance never mutates the board');
}
const rook = M.start('rook-path');
assert.equal(destinations(rook, 'a1').includes('a4'), false, 'rook cannot jump over a pawn');
assert.equal(destinations(rook, 'a1').includes('a3'), false, 'cannot capture own pawn');
assert.equal(M.moves(rook, at('a3')).length, 0, 'obstacles are stationary');
assert.equal(destinations(M.start('knight-flag'), 'b1').includes('c3'), true, 'knight can jump');
assert.deepEqual(destinations(M.start('pawn-flag'), 'b2').sort(), ['b3', 'b4']);
const capture = M.start('pawn-capture');
assert.deepEqual(destinations(capture, 'b2'), ['c3'], 'pawn captures diagonally, blocked forward');
const captured = M.play(capture, at('b2'), at('c3'));
assert.equal(captured.target, 1);
assert.equal(captured.done, false, 'second flag requires a separate move');
assert.equal(M.play(captured, at('c3'), at('c4')).done, true);
assert.deepEqual(destinations(M.start('rook-shield'), 'a2'), ['e2'], 'blocking must remove check');
assert.deepEqual(destinations(M.start('bishop-capture'), 'd2'), ['e3'], 'capture removes check');
const choice = M.start('choose-safety');
assert.ok(choice.movers.filter(from => M.moves(choice, from).length).length > 1, 'accept multiple correct ways to protect');
console.log('Mini-games: all 12 challenges and ' + positions + ' reachable positions passed.');
