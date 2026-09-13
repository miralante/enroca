# Ludia architecture

## Multi-game platform

Ludia evolves this checkout from Enroca into an eight-game catalogue. `ludia.js`
handles `#home` and `#ludia/<id>[/rules|exercises|play|match][/step]`.
The existing `app.js` keeps settings, privacy and the original chess routes.
The chess overview links to its 14 topics, 29 exercises, 12 challenges and matches.
Existing uncommitted compact-header styles and their notes below are preserved.

`games/shared.js` registers engines and provides seeded randomness. The seven
engines are pure, immutable and usable from Node. Each game supplies bilingual
curriculum, an engine and a view adapter. See [adding games](adding-games.md).
There are 58 new rules and 58 exercises in addition to the chess content.

New keys use the existing prefix: `enroca:ludia-progress` and
`enroca:ludia-sessions`. Successful exercises and viewed rules use stable IDs.
Each game has an independent save slot containing a version, options, seed and
legal actions. Restore replays actions through the engine; it does not trust a
serialized board. Malformed or illegal histories cannot resume. Data reset
clears both the old chess keys and the new slots, preserving other apps' keys.
Computer undo returns to the prior human turn. Local two-person undo takes back
one action. Tetris reload and undo stop automatic falling; manual play is default.

Variants: Battleship permits touching ships, one shot per turn even on a hit and
fleets 3/2/2 on 6 × 6 or 4/3/2/2 on 8 × 8. Sudoku generates unique solutions
for 2 × 2 or 2 × 3 regions. Tetris uses seven-piece bags and bounded rotation
offsets, not a claim of tournament rotation-system compliance. Dominoes is
two-person draw double-six: seven each, player 1 starts any tile, draw until a
move is possible or stock is exhausted; two passes compare remaining pips.

Checkers uses forward regular moves/captures, short kings, mandatory capture,
free choice of capture and complete multiple jumps. Crowning ends the turn.
Movement follows [WCDF English rules](https://wcdf.net/rules/rules_of_checkers_english.pdf).
Ludia automatically draws on three repetitions or 80 plies without capture or
promotion; these are stated product rules, not a tournament adjudication claim.

## Preserved chess architecture

Static site without dependencies, compilation or external service calls. Direct-file
opening works; the service worker requires HTTPS or localhost.

| File | Responsibility |
|---|---|
| index.html | Structure, navigation, dialog, live announcements and metadata |
| app.js | Hash routes, lessons, practice, support and game state |
| data.js | Learning order, diagrams and exercises without text |
| strings.es.js / strings.en.js | All text, including lessons and hints |
| assets/js/core.js | Translation, scoped storage and game sounds |
| chess.js | Pure rules functions without DOM or storage |
| sw.js | Full precache, version and cache isolation |
| scripts/check.js | Structural checks and content/engine regressions |

## Rules and state

64-cell board: a8=0, h1=63. Uppercase means White. FEN includes turn, castling,
en passant, reversible-move counter and move number. `legalMoves` rejects moves
leaving the king in check. `play` validates UI and restored moves; `apply` is an
unchecked internal transition. Kings cannot be captured. Promotion explicitly offers
queen, rook, bishop and knight.

Automatic draws: stalemate, basic insufficient material, fivefold repetition and
75 moves per side without pawn moves/captures. Checkmate takes precedence. Threefold
repetition and the 50-move rule support claims. Repetition includes turn, castling
rights and en passant only when a legal capture exists. No prospective claims or
exhaustive dead-position detection; see spec.md.
Reference: [FIDE Laws of Chess](https://handbook.fide.com/chapter/e012023), articles
3, 5 and 9, consulted 2026-09-11.

The local opponent evaluates captures, attacked destinations and mate in one. No
remote AI. Its short response timer is canceled when leaving, opening a dialog,
hiding the tab or undoing. Returning resumes a pending turn.

## Data and sound

Keys: `enroca:settings`, `enroca:progress`, `enroca:game`. Guarded storage access;
invalid values are ignored. Progress IDs are checked against the catalog. Only
successes are kept, never error counts or timing. Games restore by replaying legal
moves from the initial position, never by trusting serialized boards. Undo removes
one move or a human/opponent pair. Two-step deletion touches only Enroca keys.
Concurrent tabs are not synchronized: the last write wins. Use one tab per device
for a consistent saved journey.

Web Audio generates brief tones for moves and completed goals. `sounds` defaults to false.
The audio context is created only after opt-in; mute or hiding the tab stops active sounds.

## Accessibility and tests

Board rows, gridcells, piece/square/state labels and roving tabindex. Arrow keys,
Home/End, Enter/Space and Escape. Select-list alternative with ≥48px controls for
small squares. Visible navigation, restored dialog focus and brief live announcements.
Real screen-reader and learner review is still required beyond automated tests.

`node scripts/check.js` checks syntax, structure, translations/placeholders,
cache/disk parity, public terminology, configuration, rules and lesson regressions.
`node scripts/test-browser.cjs` is optional QA with an already available Playwright
module specified by `PLAYWRIGHT_MODULE_PATH`. No product dependency or repository
package install is needed. Serve 127.0.0.1:8099 before running it.

For metadata, edit app.config.json and run scripts/build-head.js and
scripts/build-llms-txt.js. This is maintenance, not a build needed to run the app.
See CLOUDFLARE.md for deployment and caching.

## Mini-games

`minigames.js` contains the catalog and pure `start`, `moves`, `play` and `solution`
functions. Smaller boards show a subset of normal chess coordinates. Breadth-first
search computes hints from the current state. Check challenges delegate to
`chess.js`; movement training does not require kings. `app.js` keeps the transient
state and undo history in memory. `enroca:progress.minigames` only saves completed
goals. Loading accepts older progress without that field; reset also removes goals.
`scripts/test-minigames.js` checks all 178 reachable positions remain solvable.
`scripts/test-minigames-browser.cjs` covers all 12 challenges, navigation, lists,
languages, screen sizes and offline use.

## Compact application header

The main header follows Memofun: a 44px app icon (32px below 650px),
a Nunito brand title at 28px (22px on mobile), suite attribution and aligned
utility controls. It uses an 8px vertical inset and a 6px row gap. Supporting
copy uses regular weight; any star counter stays compact. Header language buttons, where present,
show full names on desktop and ES/EN on mobile, with full accessible names.
Teclatlon keeps its keyboard controls and settings; Enroca keeps its navigation
and settings. These header styles do not change activity controls.
