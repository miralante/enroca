'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

function startServer() {
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(ROOT, relative);
    if (!filePath.startsWith(ROOT + path.sep) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  const sw = fs.readFileSync(SW_PATH, 'utf8');
  const version = sw.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(version, 'sw.js debe declarar VERSION');
  const filesBlock = sw.match(/(?:FILES|ARCHIVOS)\s*=\s*\[([\s\S]*?)\]/);
  assert.ok(filesBlock, 'sw.js debe declarar FILES o ARCHIVOS');
  const files = [...filesBlock[1].matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]);
  assert.ok(files.length > 0, 'La lista de caché no puede estar vacía');
  for (const relative of files) {
    assert.ok(fs.existsSync(path.join(ROOT, relative.replace(/^\.\//, ''))), `Falta en disco: ${relative}`);
  }

  const server = await startServer();
  const address = server.address();
  try {
    for (const route of ['/', '/index.html']) {
      const response = await fetch(`http://127.0.0.1:${address.port}${route}`);
      assert.equal(response.status, 200, `La ruta ${route} no responde 200`);
    }
    console.log(`SW smoke PASS (${version[1]})`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(`SW smoke FAIL: ${error.stack || error.message}`);
  process.exitCode = 1;
});

