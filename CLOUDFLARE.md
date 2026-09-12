# Enroca deployment

Enroca uses Cloudflare Workers static assets, following the Apptonomia runbook
at ../apptonomia/CLOUDFLARE.md. Configured custom domain:
https://enroca.apptonomia.uk/ (live since 2026-09-12).

1. Run `node scripts/check.js` and `node scripts/check-version-bump.js`.
2. Review `.assetsignore`, `_headers`, `wrangler.toml` and the exact source diff.
3. Repository: https://github.com/miralante/enroca (public, branch `main`).
   Initial publication and deployment were authorized on 2026-09-12.
4. This app currently uses manual Wrangler deployments. GitHub Actions validates
   commits but does not deploy. Workers Builds is not connected; future pushes to
   GitHub need a separate `wrangler deploy`. No framework or build step is required.
5. Use `npx wrangler@4.129.1 login` to renew authentication, then
   `npx wrangler@4.129.1 deploy --dry-run` and `npx wrangler@4.129.1 deploy`.
   Wrangler is a deployment tool, not an application dependency. The custom domain
   is declared in `wrangler.toml`; deploy provisions it in the account owning the zone.
6. Verify the deployed origin in a fresh browser session: both languages, 320/375/768/desktop,
   offline after first visit, local voice, install icons, promotions and data reset.
7. Roll back via the previous Workers version when necessary. Increment the cache
   version in a forward fix so returning devices receive the corrected assets.

## Cache contract

`sw.js` VERSION starts at `enroca-v1`. Bump it for every release changing a
precache entry. Install fetches with cache:reload. A new worker waits for old tabs
rather than replacing code during a game. Activation deletes only Enroca caches
for its own scope. HTML/CSS/JS revalidate at the HTTP layer; only unchanged font
assets are immutable. No long-lived immutable application URLs without versioning.

## Local use

Open `index.html` directly, or run `python scripts/serve.py`
in this directory. Direct-file use supports lessons, exercises, game and guarded
storage; PWA installation and offline caching require HTTPS or localhost.

GitHub publication and its validation workflow succeeded on 2026-09-12.
Production deployment succeeded on 2026-09-12 using Wrangler 4.129.1.
Cloudflare version: `1631bbd8-8eb8-400f-986d-17805a36a1f9`.
Runtime source: commit `17bf8fd`; subsequent publication-report changes are docs only.
The 23 public assets were uploaded. Source-control files, docs and local tooling
are excluded by `.assetsignore` and return 404 on the published origin.

Published-origin Chromium QA passed: all 28 exercises, lessons, local/computer
games, explicit promotion, keyboard, ES/EN, 320/375/768/1280 px, offline use and
local data reset. HTTP cache/security headers and asset MIME types were checked.

On Windows, if Node cannot validate a certificate trusted by the operating system,
run Wrangler with `$env:NODE_USE_SYSTEM_CA='1'` (supported by the tested Node 24).
This uses the system trust store while retaining TLS certificate verification.
