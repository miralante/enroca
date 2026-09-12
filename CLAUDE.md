# Enroca — agent handbook

Enroca teaches chess through short lessons, comprehension exercises and supported play.
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
- Increment `sw.js` VERSION (`enroca-vN`) whenever a shipped file changes after release.
- Use only `enroca:` localStorage keys. Never clear other apps' data.
- Keep this sibling independently shippable: no runtime imports from siblings.
- No telemetry, accounts, remote voices, external fonts or remote chess engines.
- No clinical or audience labels in public UI, metadata or READMEs.
- Use short sentences, one idea per step, calm feedback and optional support.
- Preserve keyboard use, local voices, visible focus, responsive layout and contrast.
- Do not publish, push or create external repositories without user authorization.

## Orientation

`data.js` defines lesson order, demonstration positions and exercises.
`strings.es.js` / `strings.en.js` own all copy; `assets/js/core.js` owns local
storage, translation and optional device voice. `chess.js` is a pure rules engine,
also loaded by Node tests. `app.js` renders hash routes and manages the journey.
`sw.js` precaches the whole product and deletes only Enroca caches in its scope.
`CLOUDFLARE.md` is the deployment runbook. `doc/en/team.md` describes validation
with learners and supporters; do not claim certified accessibility or learning gains.
