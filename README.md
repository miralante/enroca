# Ludia

> 🌐 **Other languages:** [Español](README.es.md)
>
> 🚀 **Try it live:** [ludia.apptonomia.uk](https://ludia.apptonomia.uk/)

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![No dependencies](https://img.shields.io/badge/dependencies-none-success.svg)](#-features)
[![Static site](https://img.shields.io/badge/build-none-informational.svg)](#-features)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8.svg)](manifest.json)
[![i18n](https://img.shields.io/badge/i18n-es%20%7C%20en-yellow.svg)](#-project-documentation-bilingual)
[![CI](https://img.shields.io/badge/CI-node%20scripts%2Fcheck.js-blue.svg)](.github/workflows/validate.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

**Ludia** is a **free, static, dependency-free web app**
that **brings eight board and puzzle games to life with visual rules,
interactive exercises and full local play**.

No accounts, no cookies, no analytics: everything runs in the
browser and progress is saved only in `localStorage`, on your own
device.

- 🌐 **App**: [ludia.apptonomia.uk](https://ludia.apptonomia.uk/)
- 📦 **Repository**: [github.com/miralante/ludia](https://github.com/miralante/ludia)
- 💻 **Run locally**: open `index.html` directly in a browser, or
  serve the folder with any static server (`npx serve .` /
  `python -m http.server 8080`) for the full offline-capable PWA
  experience.

---

## 🚀 Try it live

Ludia is deployed at **[ludia.apptonomia.uk](https://ludia.apptonomia.uk/)** —
open it in a browser, install it to the home screen for offline
use, and start. No accounts, no telemetry.

---

## ✨ Features

Ludia is **eight games with rules, exercises and full local play**:
Tic-tac-toe, Connect Four, Battleship, Visual Sudoku, Tetris,
Dominoes, Checkers and Chess.

- 🎮 **Eight games** — each with visual rules, interactive exercises
  and complete local play for one or two players.
- 🌐 **Bilingual** — Spanish (default) and English throughout.
- 🪶 **Zero runtime dependencies** — pure HTML/CSS/JS, no build.
- 🔒 **Privacy by default** — no accounts, no cookies, no
  analytics: all data lives in `localStorage` on the user's device.
- 📦 **Offline-capable PWA** — installable, works without internet.
- 🖐️ **Accessibility** — keyboard controls, large text, high
  contrast, optional hints, undo and saved games; sounds are off by
  default.

---

## 📖 About

Ludia is an **adapted-games catalogue**: eight games (tic-tac-
toe, connect four, battleship, visual sudoku, tetris, dominoes,
checkers and chess), each with a rules section, interactive
exercises that rehearse the rules step by step, and a full local
match against the built-in engine (or another person on the same
device). The chess curriculum and engine are preserved from the
original Enroca project; the public name is **Ludia** for the
whole catalogue.

Ludia ships as a static, dependency-free web app and a
progressive web app. It is one of the **Miralante** suite of
seven sibling apps — see [🌐 The Miralante suite](#-the-miralante-suite--projects-in-the-suite)
below for the full list. The real product specification lives in
[`doc/en/spec.md`](doc/en/spec.md); this README deliberately
avoids rephrasing product decisions to keep the public
description and the spec in lock-step.

---

## 🎯 Goals

Ludia is built to:

- ♟️ **Offer eight games with rules, exercises and matches** —
  each game's rules are taught step by step through interactive
  exercises before the match is unlocked.
- 🎮 **Let a new user open the app and play within minutes** —
  no tutorial, no install step beyond the PWA.
- 🌐 **Stay bilingual end-to-end** — Spanish is the default
  and source of truth; English keeps parity in every string.
- 🔒 **Keep progress on the user's device only** — every saved
  game lives in `localStorage` under the `enroca:` prefix
  (kept Enroca-compatible on purpose, see `CLAUDE.md`); nothing
  is ever uploaded.
- 📦 **Work offline as a PWA** — install, close the laptop,
  keep playing.
- 🪶 **Stay dependency-free** — pure HTML/CSS/JS, no build.
- 🖐️ **Meet the suite's accessibility baseline** — large text,
  high contrast, keyboard controls, optional hints, undo and
  saved games; sounds off by default.

Each goal cross-references a spec section in
[`doc/en/spec.md`](doc/en/spec.md); if a goal is not in the spec,
either add it to the spec or drop it from this list.

---

## 👥 Audience & roles

Ludia is designed for a **typical user profile** — anyone who
wants to learn, practice and play adapted games on their own
device, with no account and no pressure. The real product
specification lives in [`doc/en/spec.md`](doc/en/spec.md); this
README deliberately avoids any clinical label so the public
description stays generic.

The project recognises three roles around the app, each with its
own entry point:

| Role | Who they are | How they participate | Where they look first |
|---|---|---|---|
| 👤 **End user** | Plays the games | Opens it in a browser; doesn't read or write code | The app |
| ❤️ **Support** | Family, therapist, teacher | Accompanies, supervises, adjusts difficulty | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| 💻 **Build** | Developer | Implements, maintains, reviews PRs, deploys | [`technical.md`](doc/en/technical.md) |

See [`doc/en/roles.md`](doc/en/roles.md) for the full role
description.

---

## 📚 Project documentation (bilingual)

All project documentation lives in the `doc/` folder:

| Language | Entry point |
|---|---|
| 🇬🇧 English (this file) | [`doc/en/index.md`](doc/en/index.md) |
| 🇪🇸 Español | [`doc/es/indice.md`](doc/es/indice.md) |

By role and profile, the most relevant docs are:

| I am… | Start here |
|---|---|
| 👤 End user or family member | [`doc/en/readme.md`](doc/en/readme.md) |
| ❤️ Therapist, family, or support professional | [`doc/en/team.md`](doc/en/team.md) |
| 🤔 I want to understand what Ludia is and why | [`doc/en/spec.md`](doc/en/spec.md) |
| 💻 Developer | [`doc/en/technical.md`](doc/en/technical.md) |

### 📄 Other repo documents

| Document | Audience |
|---|---|
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Anyone who wants to contribute |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Contributor covenant (Contributor Covenant 2.1) |
| `CLAUDE.md` | AI agents: operational workflow, coordination and approvals |
| [`CLOUDFLARE.md`](CLOUDFLARE.md) | Canonical Cloudflare Workers deploy guide |
| Project history | Lives in `git log`; no external roadmap is maintained |
| `doc/en/i18n.md` / `doc/es/i18n.md` | Details of the ES/EN multilanguage system |
| [`doc/en/adding-games.md`](doc/en/adding-games.md) | How to add a new game to Ludia |

---

## 🛠️ Adding a new game

To add a new game to Ludia:

1. Create `games/<slug>/` with the canonical game files (use an
   existing game as a template).
2. Register the game: add its card to `index.html`, its routes to
   the router, and its static assets to `sw.js`'s `ARCHIVOS`.
3. Bump `VERSION` in `sw.js` (e.g. `ludia-vN` → `ludia-vN+1`).
4. Run `node scripts/check.js` to verify structure and parity.
5. Read [`doc/en/adding-games.md`](doc/en/adding-games.md) first —
   design rules, tone and accessibility requirements for our
   audience.

---

## ✅ Validating changes

```bash
node scripts/check.js
```

No `npm install` needed — the script only uses Node's standard
library. It checks JS syntax, canonical file anatomy, sw.js ↔
disk parity, es/en key parity, and the game-parity lock.

Ludia also ships a service worker, so also run:

```bash
node scripts/check-version-bump.js
```

to confirm any cached-file change came with a `VERSION` bump in
`sw.js` (the cache-bump gate).

---

## ☁️ Deploying

Ludia is a fully static site (HTML/CSS/JS, no build step), so it
ships directly to **[Cloudflare Workers (static
assets)](https://developers.cloudflare.com/workers/static-assets/)**
through its built-in GitHub integration. The HTTP security headers
live in [`_headers`](_headers), and the project metadata in
[`wrangler.toml`](wrangler.toml). See
[`CLOUDFLARE.md`](CLOUDFLARE.md) for the full runbook (rebuild,
rollback, custom domain, credential rotation).

Pull requests automatically get a preview URL on
`ludia-<branch>.<account-subdomain>.workers.dev` — no extra
workflow is needed.

---

## 🛡️ Security

Ludia is a fully client-side static site: no backend, no database,
no telemetry, no third-party runtime. The threat model is
essentially "what a hostile offline page could do to the same
origin", which the browser already sandboxes. See
[`SECURITY.md`](SECURITY.md) (or [`SECURITY.es.md`](SECURITY.es.md))
for how to report a suspected issue privately.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

---

## 🤝 Contributing

Issues and pull requests are welcome. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow (and
[`CONTRIBUTING.es.md`](CONTRIBUTING.es.md) for the Spanish
version). All participants are expected to follow
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## 🧹 Housekeeping

Quality-of-life helpers modelled on the suite standard, run
occasionally rather than on every change:

- `node scripts/check.js` is the only "test" step — it checks
  JS syntax, canonical file anatomy, sw.js ↔ disk parity, es/en
  key parity, and the game-parity lock.
- `node scripts/check-version-bump.js` — confirms any cached-file
  change came with a `VERSION` bump in `sw.js`.
- `node scripts/scan-secrets.js` — pattern-based grep that
  catches accidental API keys, tokens, or private keys. The same
  check runs as the `secrets-scan` job in CI.
- `node scripts/smoke-prod.js` — hits the live
  `*.workers.dev` URL and asserts the basic response contract.
- `node scripts/limpiar-graphify-cache.js` — dry-run shows what
  would be removed from `graphify-out/`; pass `--apply` to delete
  (the next graphify run rebuilds it from scratch).

---

## 🌐 The Miralante suite — projects in the suite

Ludia is one of **seven apps** in the **Miralante** suite, sharing
the same author, the same accessibility-first / no-backend
philosophy and the same deploy story. Apptonomia, on top of being
an app itself, also acts as the **landing portal** that introduces
the whole suite. None of the seven repos is the "main" one — they
are peers; this is just the original product this group grew out
of.

| Project | What it is | Repository |
|---|---|---|
| **Apptonomia** *(portal — landing only, no app)* | Landing page that introduces the Miralante suite (not a runtime app) | [github.com/miralante/apptonomia](https://github.com/miralante/apptonomia) |
| [Calculia](https://calculia.apptonomia.uk/) | Math and logical reasoning | [github.com/miralante/calculia](https://github.com/miralante/calculia) |
| [Ludia](https://ludia.apptonomia.uk/) | Adapted games with rules, exercises and matches | [github.com/miralante/ludia](https://github.com/miralante/ludia) |
| [Memofun](https://memofun.apptonomia.uk/) | Flashcards built around meaningful learning | [github.com/miralante/memofun](https://github.com/miralante/memofun) |
| [Okeymoney](https://okeymoney.apptonomia.uk/) | Personal finance and everyday autonomy | [github.com/miralante/okeymoney](https://github.com/miralante/okeymoney) |
| [Routime](https://routime.apptonomia.uk/) | Activities for routines and daily-life skills | [github.com/miralante/routime](https://github.com/miralante/routime) |
| [Sinonimia](https://sinonimia.apptonomia.uk/) | Easy-read dictionary | [github.com/miralante/sinonimia](https://github.com/miralante/sinonimia) |
| [Teclatlon](https://teclatlon.apptonomia.uk/) | Touch-typing with a physical keyboard | [github.com/miralante/teclatlon](https://github.com/miralante/teclatlon) |