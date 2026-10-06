// Serve the generated site locally to verify hosted home URLs and local-preview fallbacks.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  ({ chromium } = createRequire(path.resolve(__dirname, '../../.site-tools/qa/package.json'))(
    'playwright-core',
  ));
}
(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    let file = path.resolve(root, '.' + decodeURIComponent(pathname));
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
    if (!fs.existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', (route) => route.abort());
    for (const route of [
      'catalogue.html',
      'categories/screwdrivers.html',
      'products/rit-0200.html',
    ]) {
      await page.goto(`${origin}/${route}`);
      await page.locator('header .brand').click();
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(await page.locator('body').getAttribute('data-page'), 'home');
    }
    await page.goto(`${origin}/index.html?q=tools#custom-manufacturing`);
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(new URL(page.url()).search, '?q=tools');
    assert.equal(new URL(page.url()).hash, '#custom-manufacturing');
    console.log('PASS: hosted home links use / and index.html cleanup preserves query/anchor.');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
