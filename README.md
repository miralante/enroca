# Enroca

**Chess, step by step.** An [Apptonomia](https://apptonomia.uk/) app.

Boards, pieces, challenges and matches.

- 14 topics with visual examples and actions in one continuous journey.
- 29 tasks: find squares, choose answers and move pieces.
- 12 challenges with flags, paths, captures and king protection.
- Matches with few or all pieces, against Enroca or another person.
- Optional game sounds, off by default. No narration.
- No clocks, accounts, advertising, telemetry or runtime dependencies.
- Spanish and English. Keyboard control, larger text, contrast and piece names.
- Local progress, undo, resume and confirmed data deletion.
- Installable PWA; works offline after the first served visit.

## Open

Open [index.html](index.html) directly. For installation and offline caching,
run `python scripts/serve.py` and open
http://127.0.0.1:8099/. No packages or build step are needed.

**[Open Enroca](https://enroca.apptonomia.uk/)** ·
[Source on GitHub](https://github.com/miralante/enroca).

## Guides

[Getting started](doc/en/readme.md) · [Supporting someone](doc/en/team.md) ·
[Product](doc/en/spec.md) · [Technical](doc/en/technical.md) · [Español](README.es.md).

## Check

`node scripts/check.js` checks structure, translations, content, cache and chess rules.
`node scripts/check-version-bump.js` checks cache version changes.

Easy-read and accessibility adaptations still need validation with learners and
supporters. They are not a certification or evidence of learning effectiveness.

MIT. Local suite fonts: Atkinson Hyperlegible and Nunito.
