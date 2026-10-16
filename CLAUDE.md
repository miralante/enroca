# Ludia — agent handbook

## Shared Playwright installation

Playwright and its browsers are installed globally for the machine by
`dev/setups/pc-playwright-first-setup.ps1` or
`pc-playwright-next-setup.ps1`. Run the project's existing browser-test
command (for example, `npm run test:ui`) or invoke the global CLI with
`playwright test`.

Do not add `playwright` or `@playwright/test` to project dependencies, install
Playwright with `npm`/`npx`, or run `npx playwright install`. The setup scripts
manage the shared browser cache under `{drive}\apps\playwright_browsers`.
Always attempt the relevant browser test; if the global CLI or browsers are
unavailable, report that blocker and continue with the other checks.

Ludia is an extensible catalogue of eight games with rules, exercises and matches.
It preserves Enroca's complete chess curriculum and engine. See
`doc/en/adding-games.md` for the new game contract. The public name is Ludia;
the checkout, deployment identifiers and storage prefix remain Enroca-compatible.
It is an independent sibling in Apptonomia. Read `doc/en/spec.md` (Spanish mirror
`doc/es/spec.md`) for product decisions and `doc/en/technical.md` (`doc/es/tecnico.md`)
for architecture. Follow the suite's `../apptonomia/doc/en/guia-de-cumplimiento.md`
and new-sibling recipe. This file is the operational source of truth.

## Workflow

- Inspect git status and recent history before edits. Preserve existing changes.
- Vanilla HTML/CSS/JavaScript, zero runtime dependencies, no bundler or install step.
- All visible strings and curriculum text have Spanish and English parity.
- Run `node scripts/check.js`; it includes engine and content regression tests.
- Run `node scripts/check-version-bump.js` when changing cached files.
- Before pushing, run `npm run test:ui`, `node scripts/smoke-sw.js`, and
  `node scripts/check-version-bump.js`; do not push if any required check fails.
- Increment `sw.js` VERSION (`enroca-vN`) whenever a shipped file changes after release.
- Use only `enroca:` localStorage keys. Never clear other apps' data.
- Keep this sibling independently shippable: no runtime imports from siblings.
- No telemetry, accounts, remote voices, external fonts or remote chess engines.
- No clinical or audience labels in public UI, metadata or READMEs.
- Use short sentences, one idea per step, calm feedback and optional support.
- Every game has Rules / Exercises / Play, as explicitly requested for Ludia.
  Keep feedback calm, never label support use, and allow all phases immediately.
- No narration or speech synthesis. Optional game sounds only, off by default.
- Preserve keyboard use, optional game sounds, visible focus, responsive layout and contrast.
- Do not publish, push or create external repositories without user authorization.

## Orientation

`games/shared.js` owns the extensible registry; game engines, bilingual curricula
and view adapters live in `games/`. `ludia.js` owns the catalogue, course flow,
match lifecycle and replayable sessions. `assets/css/ludia.css` and
`assets/css/game-boards.css` add the new visual identity and boards.

For chess, `data.js` defines lesson order, demonstration positions and exercises.
`strings.es.js` / `strings.en.js` own all copy; `assets/js/core.js` owns local
storage, translation and optional game sounds. `chess.js` is a pure rules engine,
also loaded by Node tests. `app.js` renders hash routes and manages the journey.
`sw.js` precaches the whole product and deletes only Enroca caches in its scope.
`CLOUDFLARE.md` is the deployment runbook. `doc/en/team.md` describes validation
with learners and supporters; do not claim certified accessibility or learning gains.

## Asset version tokens (`?v=`) — never hand-edit these

This project's `_headers` serves some assets as
`Cache-Control: public, max-age=31536000, immutable`: one year, no
revalidation. A changed asset only reaches a returning visitor if the
URL referencing it changes, which is what `?v=` is for. The tokens used
to be a hand-typed serial, so the same asset ended up with different
tokens on different pages and a missed reference failed silently.

The token is now a hash of the file's own bytes. Do not type one by hand:

```bash
node ../scripts/asset-tokens.js ludia           # rewrite
node ../scripts/asset-tokens.js --check ludia   # verify
```

`scripts/check-version-bump.js` runs the check, so a stale token fails
the pre-push gate with the exact value it expects. Which files are
tokenised is read from this project's own `_headers` — see
[../scripts/ASSET-TOKENS.md](../scripts/ASSET-TOKENS.md) for the
per-project table and for why `*.js` also matches nested paths and why
fonts are tokenised from CSS rather than from HTML.
