#!/usr/bin/env node
/* ============================================================
   Apptonomia suite — build-llms-txt.js
   Generates /llms.txt at each project's root from its
   app.config.json. The Markdown follows the convention proposed
   by llmstxt.org: a short summary at the root, with the long
   detail in /llms-full.txt (the latter is not generated yet — see
   the doc/{en,es}/guia-de-cumplimiento.md §7.3 for when to add it).

   Usage:
     node scripts/build-llms-txt.js                          # builds the portal (apptonomia itself)
     node scripts/build-llms-txt.js ../calculia              # builds ../calculia/llms.txt
     node scripts/build-llms-txt.js ../calculia --check      # dry-run: exits 0 if no diff
     node scripts/build-llms-txt.js --apply --all            # build every sibling in one pass
     node scripts/build-llms-txt.js --apply --target ../<s>  # build one specific sibling

   The script is idempotent: re-running with the same config
   produces the same file. It does NOT touch robots.txt (see
   build-robots.js for that; not yet shipped — siblings that
   already have robots.txt keep the existing User-agent: * /
   Allow: / shape until a follow-up adds the AI-crawler block).

   Exit codes:
     0  success (or --check with no diff)
     1  validation error / missing file / --check with diff
   ============================================================ */

'use strict';

var fs = require('fs');
var path = require('path');

function fail(msg, code) {
  console.error('ERROR: ' + msg);
  process.exit(code || 1);
}

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail('cannot read ' + p + ': ' + e.message);
  }
}

function escapeMd(s) {
  if (s == null) return '';
  return String(s)
    // Escape characters that would break Markdown list/block syntax.
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function buildLlmsTxt(cfg) {
  var lines = [];
  lines.push('# ' + (cfg.llmsTitle || cfg.name));
  lines.push('');
  if (cfg.llmsSummary) {
    lines.push('> ' + cfg.llmsSummary);
    lines.push('');
  }
  if (Array.isArray(cfg.llmsWhatItIs) && cfg.llmsWhatItIs.length) {
    lines.push('## What it is');
    lines.push('');
    cfg.llmsWhatItIs.forEach(function (item) { lines.push('- ' + escapeMd(item)); });
    lines.push('');
  }
  if (Array.isArray(cfg.llmsWhatItIsNot) && cfg.llmsWhatItIsNot.length) {
    lines.push('## What it is not');
    lines.push('');
    cfg.llmsWhatItIsNot.forEach(function (item) { lines.push('- ' + escapeMd(item)); });
    lines.push('');
  }
  if (Array.isArray(cfg.llmsResources) && cfg.llmsResources.length) {
    lines.push('## Resources');
    lines.push('');
    cfg.llmsResources.forEach(function (r) {
      var label = '[' + r.name + '](' + r.url + ')';
      if (r.description) label += ' — ' + r.description;
      lines.push('- ' + escapeMd(label));
    });
    lines.push('');
  }
  if (cfg.llmsLicense) {
    lines.push('## License');
    lines.push('');
    lines.push(escapeMd(cfg.llmsLicense));
    lines.push('');
  }
  return lines.join('\n');
}

function findSiblingDirs(suiteRoot) {
  var candidates = ['calculia', 'memofun', 'okeymoney', 'sinonimia', 'teclatlon', 'routime'];
  return candidates.map(function (slug) {
    return { slug: slug, dir: path.resolve(suiteRoot, slug) };
  }).filter(function (c) {
    try { return fs.statSync(path.join(c.dir, 'app.config.json')).isFile(); }
    catch (e) { return false; }
  });
}

function main() {
  var argv = process.argv.slice(2);
  if (argv.indexOf('--help') !== -1 || argv.indexOf('-h') !== -1) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 38).map(function (l) { return l.replace(/^      /, ''); }).join('\n'));
    process.exit(0);
  }

  var checkOnly = argv.indexOf('--check') !== -1;
  var apply = argv.indexOf('--apply') !== -1;
  var allFlag = argv.indexOf('--all') !== -1;
  var targetIdx = argv.indexOf('--target');
  var targetArg = targetIdx !== -1 ? argv[targetIdx + 1] : null;
  // Robust argv parsing: only skip the index right after --target when that
  // flag is actually present (targetIdx !== -1); otherwise index 0 is a
  // legitimate positional. See the matching fix in build-head.js.
  var skipIdx1 = targetIdx !== -1 ? targetIdx + 1 : -1;
  var siblingArg = argv.find(function (a, i) {
    return i !== targetIdx && i !== skipIdx1 && a !== '--check' && a !== '--apply' && a !== '--all' && !a.startsWith('--');
  });

  var here = __dirname;
  var suiteRoot = path.resolve(here, '..', '..');
  var siblings = [];
  if (allFlag) {
    siblings = findSiblingDirs(suiteRoot);
    siblings.unshift({ slug: 'apptonomia', dir: path.resolve(here, '..') });
  } else if (targetArg) {
    siblings = [{ slug: path.basename(targetArg), dir: path.resolve(suiteRoot, targetArg) }];
  } else if (siblingArg) {
    siblings = [{ slug: path.basename(siblingArg), dir: path.resolve(suiteRoot, siblingArg) }];
  } else {
    siblings = [{ slug: 'apptonomia', dir: path.resolve(here, '..') }];
  }

  var errors = 0;
  siblings.forEach(function (s) {
    var configPath = path.join(s.dir, 'app.config.json');
    var outPath = path.join(s.dir, 'llms.txt');
    if (!fs.existsSync(configPath)) { console.error('WARN: no app.config.json in ' + s.dir + ', skipping.'); errors++; return; }
    var cfg = readJSON(configPath);
    var next = buildLlmsTxt(cfg);
    if (checkOnly) {
      var cur = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
      if (cur === next) {
        console.log('OK: ' + path.relative(process.cwd(), outPath) + ' is up to date.');
      } else {
        console.error('DIFF: ' + path.relative(process.cwd(), outPath) + ' is out of date; run without --check to update.');
        errors++;
      }
      return;
    }
    if (!apply && siblings.length === 1 && !siblingArg) {
      // Single-portal default mode: write without forcing --apply, matches the
      // build-head.js UX. --apply is only required when batch-writing siblings.
    }
    fs.writeFileSync(outPath, next, 'utf8');
    console.log('wrote ' + path.relative(process.cwd(), outPath) + ' (' + cfg.name + ')');
  });
  if (checkOnly && errors > 0) process.exit(1);
}

main();
