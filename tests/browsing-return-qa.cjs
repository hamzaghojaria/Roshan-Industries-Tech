// Regression check: browsing return. Run after rebuilding the website.
const { chromium } = require('./helpers/browser.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('https://**/*', (r) => r.abort());
    const url = (file) => pathToFileURL(path.resolve(file)).href;
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      for (const listing of [
        'catalogue.html?sort=new&page=2',
        'catalogue.html?q=box&sort=desc&page=2',
        'categories/trays-storage.html?sort=asc&page=2',
        'new-arrivals.html?category=trays-storage&page=2',
      ]) {
        const [file, params] = listing.split('?');
        await page.goto(url(file) + '?' + params);
        const beforeURL = page.url();
        const cards = page.locator('.product-card');
        assert((await cards.count()) > 0);
        const link = cards.last().locator('.details-link');
        await link.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        const previousY = await page.evaluate(() => scrollY);
        const target = await link.getAttribute('href');
        await link.click();
        await page.waitForURL(/products\/rit-/);
        assert.equal(await page.locator('.mobile-product-enquiry').count(), 0);
        await page.goBack();
        await page.waitForTimeout(200);
        assert.equal(page.url(), beforeURL);
        assert(
          Math.abs((await page.evaluate(() => scrollY)) - previousY) < 5,
          'Scroll not restored: ' + listing,
        );
        assert.equal(await page.locator('a:focus').getAttribute('href'), target);
        await page.reload();
        await page.waitForTimeout(200);
        assert.equal(page.url(), beforeURL);
        assert(
          Math.abs((await page.evaluate(() => scrollY)) - previousY) < 5,
          'Reload scroll mismatch',
        );
        console.log('PASS return position, page, filters and sort: ' + width + ' ' + listing);
      }
    }
    assert.deepEqual(errors, []);
    const plain = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 700 },
    });
    await plain.goto(url('products/rit-0268.html'));
    assert.equal(await plain.locator('.mobile-product-enquiry').count(), 0);
    assert(!(await plain.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
    console.log('PASS removed enquiry bar and no-JavaScript fallback');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
