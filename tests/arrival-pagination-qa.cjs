// Regression check: arrival pagination. Run after rebuilding the website.
const { chromium } = require('./helpers/browser.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://**/*', (r) => r.abort());
  const arrivals = pathToFileURL(path.resolve('new-arrivals.html')).href;
  for (const width of [320, 390, 760, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(arrivals);
    assert.equal(await page.locator('.arrival-card').count(), 24);
    assert.equal(await page.locator('#arrival-page-status').count(), 0);
    let links = new Set();
    for (let n = 1; n <= 2; n++) {
      assert.equal(
        await page.locator('#arrival-pagination [aria-current]').getAttribute('data-page'),
        String(n),
      );
      for (const href of await page
        .locator('.arrival-card .product-image')
        .evaluateAll((nodes) => nodes.map((n) => n.href)))
        links.add(href);
      if (n < 2)
        await page
          .locator('#arrival-pagination button')
          .filter({ hasText: /^Next$/ })
          .click();
    }
    assert.equal(links.size, 40);
    assert.equal(await page.locator('.arrival-card').count(), 16);
    await page.reload();
    assert.equal(
      await page.locator('#arrival-pagination [aria-current]').getAttribute('data-page'),
      '2',
    );
    await page.locator('[data-arrival-filter="holders-stands"]').click();
    assert.equal(await page.locator('.arrival-card').count(), 10);
    assert(await page.locator('#arrival-pagination').isHidden());
    await page.locator('[data-arrival-filter="all"]').click();
    assert.equal(await page.locator('.arrival-card').count(), 24);
    assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
    await page.screenshot({
      path: 'artifacts/qa/compact-arrivals-' + width + '.png',
      fullPage: true,
    });
    console.log('PASS pagination, filters, reload and responsive ' + width);
  }
  await page.goto(pathToFileURL(path.resolve('catalogue.html')).href);
  await page.locator('#sort').selectOption('new');
  assert.equal(await page.locator('.product-card .arrival-badge').count(), 24);
  assert(await page.locator('#sort').evaluate((n) => n.classList.contains('is-new-sort')));
  assert((await page.locator('.product-card .sku').first().textContent()).includes('0268'));
  await page.reload();
  assert.equal(await page.locator('#sort').inputValue(), 'new');
  assert.equal(await page.locator('#arrival-filter').count(), 0);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    'PASS highlighted new sorting, latest first, persisted sorting and filter combination',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
