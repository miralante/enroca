# Enroca validation

Local review performed on 12 September 2026.

## Completed

- `node scripts/check.js`: structure, syntax, translations, placeholders, content,
  cache files, metadata and 19 chess regression groups pass.
- Reference trees: starting position through depth 4 (197281 leaf positions),
  Kiwipete through depth 3 (97862) and rook/pawn ending (2812).
- Chromium: the 14-lesson catalog, learning flow and all 28 exercises; hints, correction, review and
  repeating independently to improve the recorded support state.
- Two-player and computer games, invalid moves, hints, undo, restore, pending-turn
  cancellation and promotion selection/cancellation.
- Keyboard, skip link and large-control alternative to board squares.
- ES/EN with larger text, high contrast and piece names: checked screens do not
  overflow at 320, 375, 768 and 1280 pixels.
- Offline lessons and games after precaching.
- No external runtime requests or execution errors during tests.
- Confirmed deletion preserves other apps’ keys. Blocked/corrupt storage does not
  prevent play. Direct opening of index.html works.
- Own metadata/llms generators are current and repeatable.
- Apptonomia portal `node scripts/check.js` passes (134 checks).
- Catalog, docs, canonical-source table and meta-graph include Enroca (8 projects).
- Local graphify skill synchronized through the suite’s tool.

## Limits and follow-up

- The portal’s separate public-term scanner still reports seven pre-existing hits,
  verified in HEAD: six term categories in strings.es.js/strings.en.js and “children”
  in a js/script.js comment. Enroca does not introduce them. They belong to the
  existing portal and need a separate resolution there.
- The new repository has no previous revision for the cache-bump comparison.
  Initial version: enroca-v1.
- Real learner/supporter, screen-reader and installed-voice review remains.
  No certification or effectiveness claim is made.
- Published to GitHub and Cloudflare on 2026-09-12:
  https://github.com/miralante/enroca and https://enroca.apptonomia.uk/.
  GitHub Actions passed; Cloudflare version `1631bbd8-8eb8-400f-986d-17805a36a1f9`.
  The full browser suite passed again in production, including offline use and
  the four screen sizes. HTTP headers and MIME types are correct; development
  tooling and Git files are not published (404). Deployment is manual with
  Wrangler; GitHub Actions validates but does not deploy.

See [the technical guide](technical.md) to repeat browser QA.
