# Enroca v2 validation

Local review: 12 September 2026.

## Checked

- Structure, syntax, ES/EN parity, placeholders, metadata and precache.
- 19 chess regression groups, including reference move trees.
- All 12 mini-games and their 178 reachable positions remain solvable.
- Browser: all 14 topics and 29 tasks completed. “Meet the board” continues from
  presentation to locating a1, c3 and h1; hints, correction and review preserve the journey.
- Copy without phase or support labels. No speech synthesis or narration. Silence
  by default, optional game sounds and immediate cancellation on mute.
- Flags, obstacles, captures, check, undo, hints after detours, return from examples,
  and list controls that open only on request.
- Local/computer matches: legal moves, undo, resume, pending-turn cancellation,
  promotion and cancelling the dialog.
- Keyboard and focus; ES/EN, larger text, contrast and piece names without overflow
  at 320, 375, 768 and 1280 px. Large coordinates in square-location tasks.
- Offline topics, challenges and matches after first visit. No external runtime
  requests or execution errors in browser tests.
- Previous progress retained for current IDs; two former board tasks are replaced
  by three location tasks. Deletion touches only `enroca:` data.
- Blocked/corrupt storage and direct `index.html` opening checked.
- Metadata and llms.txt generators current. Cache prepared as `enroca-v2`.

## Limits

Review with people, supporters and real screen readers remains. No certification
or effectiveness is claimed. Progress indicates activity, not mastery.

Open tabs retain the old version until closed; an update does not replace an ongoing
match. GitHub Actions validates; Wrangler publishes manually.

See [the technical guide](technical.md) to repeat checks.

## Verified publication

GitHub: `a787bee`, validation passed. Cloudflare:
`54c08d76-d01d-478c-b917-152f2d837081`, cache `enroca-v4`.
Both browser suites also passed at https://ludia.apptonomia.uk/, including
all 29 tasks, 12 challenges, screen sizes and offline use.
24 public assets; Git, configuration, tests and temporary files return 404.

## Ludia verification (local)

The Ludia conversion is verified locally, separately from the historical Enroca
publication above. All 58 new rules/examples and 58 exercises pass browser tests.
Complete matches, undo, resuming, Tetris pause, domino handover, checkers keyboard
and list controls are covered. Active boards and course screens fit 320, 375, 768
and 1365 pixels in both languages with large text and high contrast. The original
29 chess exercises and 12 challenges still pass their complete browser suites.

All eight games work from the full service-worker cache. Tests cover every game
save slot, old chess progress, scoped reset, invalid histories, unavailable storage
and direct-file opening. The new icons and desktop/mobile game screens were
visually inspected. Run the four browser suites listed in the root README.
This work does not publish or change the existing hosting domain.
