# Product: Enroca

## 1. Decisions

Enroca teaches chess to people with intellectual disabilities through understanding,
practice and supported play. ES/EN name: Enroca. Slug: enroca. Intended domain:
enroca.apptonomia.uk. Single-purpose independent static PWA.
Plain HTML/CSS/JavaScript, no build. Spanish editorial source and complete English mirror.

## 2. Journey

Home presents 14 topics grouped by content. Each topic shows an idea and continues
with an action using the same title and board. “Meet the board” introduces squares,
then asks the person to find a1, c3 and h1. There are 29 location, choice and movement
tasks. Challenges and Match are available immediately. Explanation, checking and
play are internal design stages, never public phase or support labels. Copy states
the next action. Correct responses remain visible until Next is selected.

Completed topics and solved tasks are stored, distinguishing support internally.
The interface shows completion only. Correction, a hint or reviewing the lesson count as support. Errors,
attempts, timing, streaks and comparisons are not stored. Reading does not imply
mastery. Solving an exercise does not establish transfer to a new situation.

Few pieces uses kings, three pawns per side and an extra white rook: a reduced starting position. All pieces uses the standard starting position.
Legal movement rules apply in both. A shallow local opponent or two people sharing
a device; no online play or clocks. Undo remains available.

## 3. Principles

Easy-read guidance from UNE 153101:2018 EX and Inclusion Europe: short sentences,
one concept at a time, chess vocabulary explained before use.
**WCAG AA minimum, AAA wherever possible**: target text contrast 7:1, visible focus,
information beyond color alone, keyboard access, large-control board alternatives,
responsive layout and no mandatory animations. Pieces have accessible names.

No infantilizing or labeling users in product copy. No pressure, penalties, public
scores, time limits or variable rewards. No therapeutic claims. Validate comprehension
and independence with people before claiming easy-read compliance or effectiveness.

## 4. Limits

The local opponent uses very shallow evaluation, not competitive training. Rules
include special moves, checkmate, stalemate, common material draws, repetition and
50/75-move rules. Tournament claims made before an announced future move are not
implemented: draw claims concern the position already reached. No arbiter, clock,
agreement draws or exhaustive dead-position detection. See the technical guide.
Special-rule lessons can be repeated without blocking introductory play.

The support guide proposes qualitative observation, not diagnosis.

## 5. Mini-games (v2)

Twelve optional challenges in Challenges, also linked from Home.
Four movement goals on 4 × 4 boards, four paths/captures on 6 × 6 boards, and four
king-protection situations on full boards with few pieces. See [mini-games](mini-games.md).
The first eight explicitly simplify rules: one movable piece, stationary other
pieces, no turns, check or opponent. Piece movement and capture geometry is preserved.
The last four challenges enforce check rules.

The first group initially shows destinations; later groups offer them on request.
People can show destinations or ask for a hint at any time. There are no level gates
or automatic ability-based adjustments. Hints find a path from the current position;
all valid solutions are accepted. Only completed goals (supported/independent) extend
existing local progress. Errors, attempts and mini-game move histories are not saved.

## Sound

No narration or speech synthesis. Short game sounds are optional and off by default.
Visual confirmation is always present.
