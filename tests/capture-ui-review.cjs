const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const b = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await p.route('https://**/*', (r) => r.abort());
  fs.mkdirSync('artifacts/ui-review', { recursive: true });
  for (const [name, file] of [
    ['home', 'index.html'],
    ['product', 'products/rit-0001.html'],
    ['catalogue', 'catalogue.html'],
    ['about', 'about.html'],
  ]) {
    await p.goto(pathToFileURL(path.resolve(file)).href);
    await p.screenshot({ path: 'artifacts/ui-review/' + name + '.png', fullPage: true });
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(pathToFileURL(path.resolve('products/rit-0001.html')).href);
  await p.screenshot({ path: 'artifacts/ui-review/product-mobile.png', fullPage: true });
  await b.close();
})();
