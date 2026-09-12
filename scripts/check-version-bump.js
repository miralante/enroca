#!/usr/bin/env node
/*
 * scripts/check-version-bump.js — CI gate for sw.js cache bumps.
 *
 * Fails if a file listed in sw.js's cache manifest changed in this
 * diff without VERSION also being bumped in the same diff.
 *
 * Why this exists: the SW's cache-first strategy makes a
 * "forgot to bump VERSION" mistake invisible to any live /
 * post-deploy smoke test — a returning visitor's Cache Storage
 * is per-browser state that no server-side script can observe.
 * It has to be caught before it ships, from the diff, not after.
 *
 * Diff base resolution: DIFF_BASE (set by the workflow) for
 * pushes and PRs; falls back to HEAD~1; skips (does not fail) if
 * neither exists, e.g. a single-commit shallow clone or no git
 * repo at all.
 *
 * Run manually:
 *   node scripts/check-version-bump.js
 *
 * The companion `scripts/check.js` runs the same logic at every
 * CI run via .github/workflows/validate.yml.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  });
}

function readSw(ref) {
  const src = ref
    ? git(['show', ref + ':sw.js'])
    : fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const versionMatch = src.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  const listMatch = src.match(/var\s+(?:ARCHIVOS|FILES)\s*=\s*\[([\s\S]*?)\];/);
  const files = listMatch
    ? Array.from(listMatch[1].matchAll(/['"]\.\/([^'"]+)['"]/g)).map((m) => m[1])
    : [];
  return { version: versionMatch ? versionMatch[1] : null, files };
}

function resolveBase() {
  const candidates = [process.env.DIFF_BASE, 'HEAD~1'].filter(Boolean);
  for (const ref of candidates) {
    try {
      git(['cat-file', '-e', ref]);
      return ref;
    } catch (e) { /* try next */ }
  }
  return null;
}

let isGitRepo = true;
try {
  git(['rev-parse', '--is-inside-work-tree']);
} catch (e) {
  isGitRepo = false;
}
if (!isGitRepo) {
  console.log('~ skipping VERSION-bump check: not a git repository');
  process.exit(0);
}

const base = resolveBase();
if (!base) {
  console.log('~ skipping VERSION-bump check: no previous commit to diff against');
  process.exit(0);
}

const before = readSw(base);
const after = readSw(null);

if (!after.version || !after.files.length) {
  console.error('✗ could not parse VERSION or the cache manifest from the current sw.js');
  process.exit(1);
}

let changed;
try {
  changed = git(['diff', '--name-only', base, 'HEAD']).split('\n').filter(Boolean);
} catch (e) {
  console.error('✗ could not diff against ' + base + ': ' + e.message);
  process.exit(1);
}

const cachedChanged = changed.filter((f) => after.files.indexOf(f) !== -1);

if (cachedChanged.length && before.version === after.version) {
  console.error('✗ these sw.js-cached files changed but VERSION (' + after.version + ') was not bumped:');
  cachedChanged.forEach((f) => console.error('    ' + f));
  console.error('  Returning visitors with the PWA installed won\'t see this change until VERSION is bumped (see CLAUDE.md §B.1).');
  process.exit(1);
}

console.log(
  '✓ sw.js VERSION bump check passed (' + cachedChanged.length + ' cached file(s) changed' +
  (cachedChanged.length ? ', VERSION correctly bumped: ' + before.version + ' -> ' + after.version : ', VERSION unchanged as expected') + ')'
);
