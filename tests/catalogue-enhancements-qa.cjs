const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  assert = require('node:assert/strict');
const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const selected = JSON.parse(fs.readFileSync('src/data/new-arrivals.json', 'utf8')).skus;
    for (const width of [320, 390, 760, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + '/catalogue.html');
      assert.equal(await page.locator('#arrival-filter').count(), 0);
      await page.goto(origin + '/catalogue.html?new=1');
      assert(
        (await page.locator('#results-count').textContent()).includes(
          'of ' + selected.length + ' products',
        ),
      );
      assert.equal(await page.locator('#catalogue-grid .product-card').count(), 24);
      assert.equal(await page.locator('#catalogue-grid .arrival-badge').count(), 24);
      await page.locator('#pagination button').filter({ hasText: 'Next' }).click();
      assert.equal(
        await page.locator('#catalogue-grid .arrival-badge').count(),
        selected.length - 24,
      );
      await page.reload();
      assert.equal(await page.locator('#arrival-filter').count(), 0);
      await page.locator('#catalogue-query').fill('RIT-0268');
      assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
      await page.locator('#catalogue-query').fill('RIT-0001');
      assert.equal(await page.locator('#catalogue-grid .product-card').count(), 0);
      await page.goto(origin + '/catalogue.html?q=RIT-0001');
      assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
      await page.goto(origin + '/products/rit-0268.html');
      await page.locator('.detail-image img').evaluate((el) => el.decode());
      assert.equal(await page.getByRole('link', { name: /Explore in catalogue/ }).count(), 1);
      const upper = await page.locator('.enquiry-actions').boundingBox(),
        lower = await page.locator('.product-catalogue-actions').boundingBox();
      assert(Math.abs(upper.x - lower.x) < 1 && Math.abs(upper.width - lower.width) < 1);
      assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      await page.screenshot({ path: 'artifacts/qa/scissors-and-actions-' + width + '.png' });
      await page.goto(origin + '/catalogue.html?new=1');
      await page.screenshot({ path: 'artifacts/qa/arrival-filter-' + width + '.png' });
      assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
    }
    // Observe the loader on a slow document script, then verify it clears.
    await page.route('**/app.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + '/about.html', { waitUntil: 'commit' });
      await page.locator('.page-loader').waitFor({ state: 'visible' });
      await page.waitForLoadState('domcontentloaded');
      await page.locator('.page-loader').waitFor({ state: 'hidden' });
    }
    await page.unroute('**/app.js');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.documentElement.classList.add('page-loading'));
    assert.equal(
      await page.locator('.page-loader-ring').evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );
    await page.evaluate(() =>
      dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
    );
    assert(!(await page.locator('.page-loader').isVisible()));
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.goto(origin + '/catalogue.html');
    assert(!(await plain.locator('.page-loader').isVisible()));
    assert.equal(await plain.locator('#catalogue-grid .product-card').count(), 268);
    await noJs.close();
    assert.deepEqual(errors, []);
    console.log(
      'PASS New Arrivals filter, combined search, pagination, reload, mobile layout, catalogue action alignment, loader on phone/desktop, reduced motion and no-JavaScript fallback.',
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
