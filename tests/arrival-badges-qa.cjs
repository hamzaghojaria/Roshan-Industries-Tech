const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const selected = new Set(JSON.parse(fs.readFileSync('src/data/new-arrivals.json', 'utf8')).skus);
  const vm = require('node:vm');
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('products.js', 'utf8'), context);
  for (const product of context.window.ROSHAN_PRODUCTS) {
    const html = fs.readFileSync(product.url, 'utf8');
    assert.equal(
      html.includes('class="arrival-badge arrival-badge-detail">New</span>'),
      selected.has(product.sku),
      product.sku,
    );
  }
  const b = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const p = await b.newPage({ reducedMotion: 'reduce' });
  await p.route('https://**/*', (r) => r.abort());
  for (const width of [390, 1440]) {
    await p.setViewportSize({ width, height: 900 });
    for (const sku of selected) {
      await p.goto(pathToFileURL(path.resolve('catalogue.html')).href + '?q=' + sku);
      assert.equal(await p.locator('#catalogue-grid .arrival-badge').count(), 1);
      assert.equal(await p.locator('#catalogue-grid .arrival-badge').textContent(), 'New');
      await p.goto(pathToFileURL(path.resolve('products/' + sku.toLowerCase() + '.html')).href);
      assert.equal(await p.locator('.arrival-badge-detail').count(), 1);
    }
    await p.goto(pathToFileURL(path.resolve('new-arrivals.html')).href);
    assert.equal(await p.locator('.arrival-badge').count(), Math.min(24, selected.size));
    await p.goto(pathToFileURL(path.resolve('index.html')).href);
    assert.equal(await p.locator('.home-arrivals .arrival-badge').count(), 0);
    assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
  }
  await b.close();
  console.log(
    'PASS: selected badges on product pages, filtered catalogue, New Arrivals and Home at mobile/desktop; unselected product pages have no badge.',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
