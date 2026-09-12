'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let count = 0; const failures = [];
function check(condition, text) { count++; if (!condition) failures.push(text); }
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.tmp') || ['.git', '.claude', 'node_modules', '.cache', 'graphify-out', '.wrangler'].includes(e.name)) return [];
    const file = path.posix.join(dir, e.name); return e.isDirectory() ? walk(file) : [file];
  });
}
const files = walk();
for (const file of files) {
  check(fs.statSync(path.join(root, file)).size < 25 * 1024 * 1024, file + ': exceeds 25 MB');
  if (/\.(js|cjs)$/.test(file)) {
    try { execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' }); count++; }
    catch (error) { failures.push(file + ': ' + String(error.stderr)); }
  }
}
const required = ['AGENTS.md', 'CLAUDE.md', 'README.md', 'README.es.md', 'LICENSE', 'CONTRIBUTING.md', 'CONTRIBUTING.es.md', 'CODE_OF_CONDUCT.md', 'CODE_OF_CONDUCT.es.md', 'SECURITY.md', 'SECURITY.es.md', 'CLOUDFLARE.md', '_headers', '.assetsignore', 'wrangler.toml', '404.html', 'index.html', 'app.js', 'data.js', 'chess.js', 'minigames.js', 'manifest.json', 'sw.js', 'scripts/check-version-bump.js', '.github/workflows/validate.yml', 'doc/en/index.md', 'doc/es/indice.md', 'llms.txt', 'robots.txt', 'sitemap.xml'];
required.forEach(file => check(exists(file), 'Missing ' + file));
const dictionaries = {};
for (const lang of ['es', 'en']) vm.runInNewContext(read('strings.' + lang + '.js'), { window: { App: { i18n: { register(locale, data) { dictionaries[locale] = data; } } } } });
const keys = Object.keys(dictionaries.es).sort();
check(JSON.stringify(keys) === JSON.stringify(Object.keys(dictionaries.en).sort()), 'ES/EN key parity');
for (const key of keys) {
  const markers = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  check(markers(dictionaries.es[key]) === markers(dictionaries.en[key]), 'Placeholder mismatch ' + key);
  check(dictionaries.es[key].length > 0 && dictionaries.en[key].length > 0, 'Empty translation ' + key);
}
const lessons = require('../data.js');
check(lessons.length === 14, '14 lessons required');
const ids = new Set();
for (const lesson of lessons) {
  check(!ids.has(lesson.id), 'Duplicate lesson ' + lesson.id); ids.add(lesson.id);
  for (const suffix of ['title', 'intro', ...Array.from({ length: lesson.steps }, (_, i) => 'step.' + i)]) check(keys.includes('lesson.' + lesson.id + '.' + suffix), 'Missing lesson text ' + lesson.id + '.' + suffix);
  for (const [square, p] of Object.entries(lesson.pos)) check(/^[a-h][1-8]$/.test(square) && /^[prnbqkPRNBQK]$/.test(p), 'Invalid diagram ' + lesson.id);
  for (const q of lesson.exercises) {
    check(!ids.has(q.id), 'Duplicate exercise ' + q.id); ids.add(q.id);
    check(keys.includes(q.key) && keys.includes(q.key + '.hint'), 'Missing exercise copy ' + q.id);
    if (q.type === 'choice') {
      check(q.answer >= 0 && q.answer < q.options, 'Invalid correct answer ' + q.id);
      for (let i = 0; i < q.options; i++) check(keys.includes(q.key + '.a.' + i), 'Missing option ' + q.id);
    } else if (q.type === 'locate') check(/^[a-h][1-8]$/.test(q.to), 'Invalid location task ' + q.id);
    else check(q.from in lesson.pos && /^[a-h][1-8]$/.test(q.to), 'Invalid movement task ' + q.id);
  }
}
check(lessons.flatMap(l => l.exercises).length === 29, '29 exercises required');
const miniCatalog = require('../minigames.js').catalog;
check(miniCatalog.length === 12, '12 mini-games required');
for (const challenge of miniCatalog) {
  check(!ids.has(challenge.id), 'Duplicate mini-game ' + challenge.id); ids.add(challenge.id);
  check(lessons.some(l => l.id === challenge.lesson), 'Missing review lesson ' + challenge.id);
  for (const suffix of ['title', 'intro', 'rule']) check(keys.includes('mini.' + challenge.id + '.' + suffix), 'Missing mini-game copy ' + challenge.id + '.' + suffix);
}
const html = read('index.html'), app = read('app.js');
for (const match of (html + app).matchAll(/(?:data-i18n="|\bt\(')([\w.-]+)(?:"|'\s*[,\)])/g)) check(keys.includes(match[1]), 'Unknown literal translation ' + match[1]);
check(!/speechSynthesis|SpeechSynthesisUtterance|\btts\b/.test(app + read('assets/js/core.js')), 'Narration must not return');
const sw = read('sw.js');
const entries = [...sw.match(/var ARCHIVOS = \[([\s\S]*?)\];/)[1].matchAll(/"(.+?)"/g)].map(m => m[1]);
check(/var VERSION = 'enroca-v\d+'/.test(sw), 'Missing semantic SW version');
for (const entry of entries) check(entry === './' || exists(entry.slice(2)), 'Missing precache file ' + entry);
for (const file of files.filter(f => /^(?:index\.html|app\.js|chess\.js|minigames\.js|data\.js|strings\..*\.js|manifest\.json|assets\/)/.test(f))) check(entries.includes('./' + file), 'Uncached runtime asset ' + file);
for (const match of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) if (!/^(https?:|mailto:)/.test(match[1])) check(exists(match[1].split('?')[0]), 'Missing HTML asset ' + match[1]);
check(html.includes('charset="UTF-8"') && html.includes('width=device-width, initial-scale=1'), 'Missing UTF-8/viewport');
check((html.match(/name="DC\./g) || []).length >= 7, 'Missing Dublin Core');
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
check(graph['@graph'].some(n => n['@type'] === 'FAQPage'), 'Missing FAQ metadata');
check(graph['@graph'].some(n => n['@type'] === 'SoftwareApplication'), 'Missing software metadata');
check(['GPTBot', 'ClaudeBot', 'PerplexityBot', 'CCBot', 'Google-Extended', 'Applebot-Extended', 'anthropic-ai', 'cohere-ai', 'Claude-Web'].every(ua => read('robots.txt').includes(ua)), 'Missing crawler list');
check(read('_headers').split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length <= 100, 'Too many headers');
const publicFiles = files.filter(f => !f.startsWith('scripts/') && !f.startsWith('doc/') && (/\.(html|js|json)$/.test(f) || /^README/.test(f)));
for (const file of publicFiles) {
  const text = read(file);
  check(!/discapacidad|disabilit|intelectual|intellectual|terapia ocupacional|occupational therap|necesidades especiales|special needs|\bpatient\b|\bpaciente\b/i.test(text), 'Public audience label in ' + file);
  check(!/localStorage\.clear\s*\(/.test(text), 'Unscoped deletion in ' + file);
  check(!/fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|google-analytics|https?:\/\/.*(?:fetch\(|XMLHttpRequest)/.test(text), 'External runtime in ' + file);
  check(!text.includes('\uFFFD') && !/\{\{(?:SLUG|DOMAIN|DISPLAY|GIT_ORG)/.test(text), 'Encoding or scaffold placeholder in ' + file);
}
for (const file of files.filter(f => f.endsWith('.md'))) {
  for (const m of read(file).matchAll(/\]\(([^)]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    check(fs.existsSync(path.resolve(root, path.dirname(file), target)), file + ': broken doc link ' + target);
  }
}
const manifest = JSON.parse(read('manifest.json'));
manifest.icons.forEach(icon => check(exists(icon.src), 'Missing install icon ' + icon.src));
check(manifest.scope === './' && manifest.start_url === './', 'PWA must support static subdirectories');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Structure/i18n/cache: ' + count + ' checks passed.');
execFileSync(process.execPath, [path.join(__dirname, 'test-chess.js')], { stdio: 'inherit' });

execFileSync(process.execPath, [path.join(__dirname, 'test-minigames.js')], { stdio: 'inherit' });
