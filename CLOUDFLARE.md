# Enroca deployment

Enroca uses Cloudflare Workers static assets, following the Apptonomia runbook
at ../apptonomia/CLOUDFLARE.md. Domain reserved by convention:
https://enroca.apptonomia.uk/ (not provisioned by this change).

1. Run `node scripts/check.js` and `node scripts/check-version-bump.js`.
2. Review `.assetsignore`, `_headers`, `wrangler.toml` and the exact source diff.
3. Obtain authorization before creating miralante/enroca, pushing or deploying.
4. Connect the approved repository to Workers Builds; no framework or build command.
5. Use `wrangler deploy` only after deployment authorization. Wrangler is a
   deployment tool, not an application dependency. Set the custom domain in Cloudflare.
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

No remote repository or production deployment is part of the initial local delivery.
