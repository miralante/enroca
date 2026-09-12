# Enroca

**Chess, step by step.** An [Apptonomia](https://apptonomia.uk/) app.

Meet the pieces. Practice what you learned. Play at your own pace.

- **Learn:** 14 short lessons, movement examples and optional local read-aloud.
- **Practice:** 28 lesson-linked exercises, optional hints and review.
- **Play:** fewer pieces or a full board, with Enroca or another person.
- No clocks, accounts, advertising, telemetry or runtime dependencies.
- Spanish and English. Keyboard control, larger text, contrast and piece names.
- Local progress, undo, resume and confirmed data deletion.
- Installable PWA; works offline after the first served visit.

## Open

Open [index.html](index.html) directly. For installation and offline caching,
run `python scripts/serve.py` and open
http://127.0.0.1:8099/. No packages or build step are needed.

Source: [miralante/enroca](https://github.com/miralante/enroca).
The intended domain is `enroca.apptonomia.uk`. Deployment is prepared;
Cloudflare authentication needs to be renewed first.

## Guides

[Getting started](doc/en/readme.md) · [Supporting someone](doc/en/team.md) ·
[Product](doc/en/spec.md) · [Technical](doc/en/technical.md) · [Español](README.es.md).

## Check

`node scripts/check.js` checks structure, translations, content, cache and chess rules.
`node scripts/check-version-bump.js` checks cache version changes.

Easy-read and accessibility adaptations still need validation with learners and
supporters. They are not a certification or evidence of learning effectiveness.

MIT. Local suite fonts: Atkinson Hyperlegible and Nunito.
