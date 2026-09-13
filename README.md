# Ludia

**Games your way.** An independent [Apptonomia](https://apptonomia.uk/) app, evolved from Enroca.

Eight games, each with rules, interactive exercises and complete play:

| Game | Discover and practise | Play |
| --- | --- | --- |
| Tic-tac-toe | 8 rules and 8 exercises | Local opponent or two people; wins and draws |
| Connect four | 8 rules and 8 exercises | Gravity, all winning directions, local opponent or two people |
| Battleship | 8 rules and 8 exercises | Manual or automatic fleets; 6 × 6 and 8 × 8 seas; local opponent |
| Visual sudoku | 8 rules and 8 exercises | Unique 4 × 4 or 6 × 6 puzzles; shapes, notes, checking and hints |
| Tetris | 8 rules and 8 exercises | Seven pieces, rotations, shadow, hold, row clears; step mode or optional automatic falling |
| Dominoes | 8 rules and 8 exercises | Full double-six set, drawing, passing, blocked games; local opponent or two people |
| Checkers | 10 rules and 10 exercises | English movement, mandatory captures, multiple jumps, kings and draws; full or reduced setup |
| Chess | 14 topics, 29 exercises and 12 challenges | Original complete engine, special moves, promotion, draws, full or reduced setup |

Spanish and English throughout. Keyboard controls, large text, high contrast,
optional hints, undo and saved games. Optional game sounds start off. Tetris
starts without automatic falling; automatic play can be paused.

Progress and one match per game stay in this browser. Confirmed data deletion
only clears this app. No accounts, advertisements, telemetry or external runtime
dependencies. Installable PWA, with offline use after the first served visit.

## Open

Open [index.html](index.html), or run `node scripts/serve.js` and visit
[the local preview](http://127.0.0.1:8099/). No install or build step is required.
The checkout, existing hosting configuration and storage namespace retain their
Enroca identifiers so existing chess progress can continue. Deployment is separate.

## Maintain and check

`node scripts/check.js` checks structure, translations, curriculum, precache and
all eight engines. `node scripts/check-version-bump.js` checks cache changes.

With Playwright already available, set `PLAYWRIGHT_MODULE_PATH` and run
`node scripts/test-ludia-browser.cjs`, `node scripts/test-browser.cjs` and
`node scripts/test-minigames-browser.cjs` and `node scripts/test-ludia-storage.cjs`
against the local preview.

[Add a game](doc/en/adding-games.md) · [Architecture](doc/en/technical.md) ·
[Product](doc/en/spec.md) · [Supporting someone](doc/en/team.md) · [Español](README.es.md).

Easy-read and accessibility adaptations still require review with learners and
supporters. Automated checks are not a certification or evidence of learning gains.

MIT. Bundled Atkinson Hyperlegible and Nunito fonts.
