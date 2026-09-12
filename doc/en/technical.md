# Enroca architecture

Static site without dependencies, compilation or external service calls. Direct-file
opening works; the service worker requires HTTPS or localhost.

| File | Responsibility |
|---|---|
| index.html | Structure, navigation, dialog, live announcements and metadata |
| app.js | Hash routes, lessons, practice, support and game state |
| data.js | Learning order, diagrams and exercises without text |
| strings.es.js / strings.en.js | All text, including lessons and hints |
| assets/js/core.js | Translation, scoped storage and device voice |
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

## Data and voice

Keys: `enroca:settings`, `enroca:progress`, `enroca:game`. Guarded storage access;
invalid values are ignored. Progress IDs are checked against the catalog. Only
successes are kept, never error counts or timing. Games restore by replaying legal
moves from the initial position, never by trusting serialized boards. Undo removes
one move or a human/opponent pair. Two-step deletion touches only Enroca keys.
Concurrent tabs are not synchronized: the last write wins. Use one tab per device
for a consistent saved journey.

SpeechSynthesis requires a `localService` voice in the active language. Remote
default voices are not used. A missing voice shows a notice; text remains available.

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
