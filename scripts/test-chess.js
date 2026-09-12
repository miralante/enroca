'use strict';
const assert = require('node:assert/strict');
const C = require('../chess.js');
const lessons = require('../data.js');
let checks = 0;
function test(name, run) { run(); checks++; console.log('  ✓ ' + name); }
function perft(s, depth) { return depth === 0 ? 1 : C.legalMoves(s).reduce((n, m) => n + perft(C.apply(s, m), depth - 1), 0); }
function move(s, from, to, promotion) { const result = C.play(s, { from: C.index(from), to: C.index(to), promotion }); assert.ok(result, from + '-' + to); return result.state; }
test('Initial position: reference move-tree counts through depth 4', () => {
  assert.deepEqual([1, 2, 3, 4].map(d => perft(C.fromFEN(C.START), d)), [20, 400, 8902, 197281]);
});
test('Kiwipete: castling, pins and checks through depth 3', () => {
  const s = C.fromFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
  assert.deepEqual([1, 2, 3].map(d => perft(s, d)), [48, 2039, 97862]);
});
test('Rook/pawn endgame: en passant and king safety', () => {
  const s = C.fromFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  assert.deepEqual([1, 2, 3].map(d => perft(s, d)), [14, 191, 2812]);
});
test('FEN round trip and square mapping', () => {
  assert.equal(C.toFEN(C.fromFEN(C.START)), C.START);
  for (let i = 0; i < 64; i++) assert.equal(C.index(C.square(i)), i);
});
test('Pinned rook cannot expose its king', () => {
  const s = C.fromFEN('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.equal(C.play(s, { from: C.index('e2'), to: C.index('d2') }), null);
});
test('Castling moves both pieces and removes rights', () => {
  const s = move(C.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), 'e1', 'g1');
  assert.equal(s.board[C.index('g1')], 'K'); assert.equal(s.board[C.index('f1')], 'R');
  assert.equal(s.board[C.index('h1')], null); assert.equal(s.castling, 'kq');
});
test('No castling through check, from check or without rook', () => {
  for (const fen of ['k4r2/8/8/8/8/8/8/4K2R w K - 0 1', 'k3r3/8/8/8/8/8/8/4K2R w K - 0 1', 'k7/8/8/8/8/8/8/4K3 w K - 0 1']) assert.ok(!C.legalMoves(C.fromFEN(fen)).some(m => m.castle));
});
test('Rook movement and rook capture revoke corresponding rights', () => {
  let s = move(C.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), 'a1', 'a8');
  assert.equal(s.castling, 'Kk');
});
test('En passant removes the neighboring pawn and expires after one move', () => {
  let s = C.fromFEN('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2');
  assert.ok(C.legalMoves(s).some(m => m.ep));
  const captured = move(s, 'e5', 'd6');
  assert.equal(captured.board[C.index('d5')], null); assert.equal(captured.halfmove, 0);
  s = move(s, 'e1', 'f1'); assert.equal(s.ep, -1);
});
test('En passant cannot expose a horizontal attack on the king', () => {
  const s = C.fromFEN('8/8/8/r4pPK/8/8/8/4k3 w - f6 0 1');
  assert.ok(!C.legalMoves(s).some(m => m.ep));
});
test('Promotion requires an explicit choice; all four choices are legal', () => {
  const s = C.fromFEN('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  assert.equal(C.play(s, { from: C.index('a7'), to: C.index('a8') }), null);
  for (const p of ['q', 'r', 'b', 'n']) assert.equal(move(s, 'a7', 'a8', p).board[0], p.toUpperCase());
});
test('Black promotion and capture promotion', () => {
  const s = C.fromFEN('4k3/8/8/8/8/8/1p6/R3K3 b - - 0 1');
  assert.equal(move(s, 'b2', 'a1', 'n').board[56], 'n');
});
test('Mate and stalemate have different outcomes', () => {
  assert.equal(C.status(C.fromFEN('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1')).reason, 'mate');
  assert.equal(C.status(C.fromFEN('k7/2Q5/2K5/8/8/8/8/8 b - - 0 1')).reason, 'stalemate');
  let s = C.fromFEN(C.START);
  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) s = move(s, from, to);
  assert.equal(C.status(s).reason, 'mate'); assert.equal(C.status(s).winner, 'b');
});
test('A king can never be captured or moved next to the other king', () => {
  const s = C.fromFEN('8/8/8/4k3/8/4K3/8/8 w - - 0 1');
  assert.equal(C.play(s, { from: C.index('e3'), to: C.index('e4') }), null);
  const attack = C.fromFEN('4k3/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.ok(!C.legalMoves(attack).some(m => m.to === C.index('e8')));
});
test('Insufficient material does not falsely include bishop plus knight', () => {
  assert.equal(C.status(C.fromFEN('4k3/8/8/8/8/8/8/4K3 w - - 0 1')).reason, 'material');
  assert.equal(C.status(C.fromFEN('4k3/8/8/8/8/8/8/2B1K3 w - - 0 1')).reason, 'material');
  assert.equal(C.status(C.fromFEN('4k3/8/8/8/8/8/8/1NB1K3 w - - 0 1')).ended, false);
});
test('50 moves are claimable; 75 moves automatic; mate takes precedence', () => {
  assert.equal(C.status(C.fromFEN('4k3/8/8/8/8/8/8/R3K3 w - - 100 60')).claim, 'fifty');
  assert.equal(C.status(C.fromFEN('4k3/8/8/8/8/8/8/R3K3 w - - 150 90')).reason, 'seventyfive');
  assert.equal(C.status(C.fromFEN('7k/6Q1/5K2/8/8/8/8/8 b - - 150 90')).reason, 'mate');
});
test('Repetition counts castling rights and only legally available en passant', () => {
  let s = C.fromFEN(C.START); const keys = [C.positionKey(s)];
  for (let n = 0; n < 4; n++) {
    for (const [from, to] of [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']]) { s = move(s, from, to); keys.push(C.positionKey(s)); }
    if (n === 1) assert.equal(C.status(s, keys).claim, 'threefold');
  }
  assert.equal(C.status(s, keys).reason, 'fivefold');
  const noCapture = C.fromFEN('4k3/8/8/4p3/8/8/8/4K3 w - e6 0 2');
  assert.equal(C.positionKey(noCapture), C.positionKey({ ...noCapture, ep: -1 }));
  const capture = C.fromFEN('4k3/8/8/3Pp3/8/8/8/4K3 w - e6 0 2');
  assert.notEqual(C.positionKey(capture), C.positionKey({ ...capture, ep: -1 }));
  const pinned = C.fromFEN('8/8/8/r4pPK/8/8/8/4k3 w - f6 0 1');
  assert.equal(C.positionKey(pinned), C.positionKey({ ...pinned, ep: -1 }));
  assert.notEqual(C.positionKey(C.fromFEN(C.START)), C.positionKey({ ...C.fromFEN(C.START), castling: '' }));
});
test('AI always returns a legal move and finds mate in one', () => {
  let s = C.fromFEN(C.START);
  for (let i = 0; i < 50 && !C.status(s).ended; i++) { const m = C.chooseMove(s); const result = C.play(s, m); assert.ok(result); s = result.state; }
  s = C.fromFEN('7k/8/5KQ1/8/8/8/8/8 w - - 0 1');
  assert.equal(C.status(C.apply(s, C.chooseMove(s))).reason, 'mate');
});
test('Every movement exercise follows the actual piece rules', () => {
  for (const lesson of lessons) for (const q of lesson.exercises.filter(q => q.type === 'move')) {
    const s = C.fromFEN('k7/8/8/8/8/8/8/6K1 w - - 0 1');
    if (lesson.piece === 'k') s.board[C.index('g1')] = null;
    Object.entries(lesson.pos).forEach(([at, piece]) => { s.board[C.index(at)] = piece; });
    assert.ok(C.play(s, { from: C.index(q.from), to: C.index(q.to) }), lesson.id);
  }
});
console.log('Chess/content: ' + checks + ' regression groups passed.');
