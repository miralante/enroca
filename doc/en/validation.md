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
`bec646da-b780-462e-83ec-935ff9085af8`, cache `enroca-v2`.
Both browser suites also passed at https://enroca.apptonomia.uk/, including
all 29 tasks, 12 challenges, screen sizes and offline use.
24 public assets; Git, configuration, tests and temporary files return 404.
