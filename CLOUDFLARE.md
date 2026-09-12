# Enroca deployment

Enroca uses Cloudflare Workers static assets, following the Apptonomia runbook
at ../apptonomia/CLOUDFLARE.md. Configured custom domain:
https://enroca.apptonomia.uk/ (pending authentication and first deployment).

1. Run `node scripts/check.js` and `node scripts/check-version-bump.js`.
2. Review `.assetsignore`, `_headers`, `wrangler.toml` and the exact source diff.
3. Repository: https://github.com/miralante/enroca (public, branch `main`).
   Initial publication and deployment were authorized on 2026-09-12.
4. For automatic deployments, connect the repository to Workers Builds; no framework
   or build command. This connection is not configured yet.
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
The Wrangler dry run passed. Public deployment is pending renewal of the expired
Cloudflare session; no production deployment has been claimed or recorded yet.
