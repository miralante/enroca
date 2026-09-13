# Adding a game to Ludia

Ludia is a registry of independent games, not a fixed menu. Use the existing
Tetris, sudoku, domino or checkers files as examples. No build step is involved.

1. Add `games/<id>.js`. Register a unique, stable kebab-case ID through
   `LudiaGames.register`. Export the same object from Node for tests.
2. Implement pure `init(options, seed)`, `move(state, action)`, `actions(state)`,
   `status(state)` and `hint(state)` functions. `move` returns a new state or
   `null` for an illegal action. Never mutate its input. Use the supplied seeded
   random function; sessions must replay deterministically.
3. `status` returns `{ ended, winner }`. Use winner 1/2 for two players and 0 for
   a draw. Solo engines can additionally return `solved` or `over`, with a custom
   status renderer. A two-player state uses `turn: 1|2`; the second side is the
   computer unless the setup selects `partner: 'local'`.
4. Add `<id>-content.js`. Supply `title`, `description`, `tag`, `color` and a
   `lessons` array. Each entry contains stable `id`, bilingual `[es, en]` title,
   body, prompt and hint. A `choice` entry has options and an answer index. A
   `board` entry has a complete fixture state, a legal demonstration action and
   an acceptance predicate. Accept equivalent valid answers where appropriate.
   Explain every rule needed to finish a match, including blocked states and
   endings. The shared UI renders Rules, Exercises and Play from this content.
5. Add `<id>-view.js`. Register its renderer in `LudiaViews[id]` and optional
   hooks in `LudiaOptions`, `LudiaPanels`, `LudiaStatus`, `LudiaCell`,
   `LudiaAction` and `LudiaHint`. `api.commit(action)` manages match history;
   `api.tryExercise(action)` checks an exercise. `api.grid` provides labelled
   cells and arrow-key navigation. Use the shared `api.button`, `t`, `esc` and
   `tr` helpers. All new shared copy goes in `LudiaCopy` as bilingual pairs.
6. Add the scripts to `index.html`: engines before content, base curriculum
   before game content, shared views before game views, all before `ludia.js`.
   Add a catalogue illustration in `illustration` in `ludia.js`; the catalogue,
   phase links, progress, settings and save slots then appear automatically.
7. List every runtime file in `sw.js` and increment its `enroca-vN` version.
   This cache prefix deliberately preserves the original app's upgrade path.
8. Add meaningful engine and curriculum tests to `scripts/test-ludia.js` and UI
   actions to `scripts/test-ludia-browser.cjs`. Cover legal and illegal moves,
   full endings, deterministic restoration, keyboard/touch, ES/EN and narrow
   widths. Run `node scripts/check.js` and the version-bump check.

Do not put DOM, timers, storage, sound or unseeded randomness in engines. Keep
timers in the UI and cancel them on navigation, pause, hidden tabs and reset.
The first seven new engines and the existing chess engine work without network
services. A new game must preserve that property.

The chess adapter preserves existing hash routes and its validated move history.
Its content can be extended using the original [element guide](creating-elements-guide.md).
