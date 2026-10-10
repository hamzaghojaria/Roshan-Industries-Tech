// Regression check: search suggestions. Run after rebuilding the website.
const { chromium } = require('./helpers/browser.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const b = await chromium.launch({
    headless: true,
  });
  try {
    const p = await b.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.route('https://**/*', (r) => r.abort());
    const url = (f) => pathToFileURL(path.resolve(f)).href;
    for (const width of [320, 390, 760, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      for (const file of [
        'index.html',
        'catalogue.html',
        'new-arrivals.html',
        'products/rit-0268.html',
        'categories/trays.html',
      ]) {
        await p.goto(url(file));
        const input = p.locator('#search');
        await input.fill('RIT-0268');
        await p.locator('#search-suggestions img').first().waitFor();
        assert((await p.locator('#search-option-0').textContent()).includes('0268'));
        assert(
          (await p.locator('#search-option-0').getAttribute('href')).endsWith(
            '/products/rit-0268.html',
          ),
        );
        for (const img of await p.locator('#search-suggestions img').all())
          assert(await img.evaluate((el) => el.decode().then(() => el.naturalWidth > 0)));
        const bounds = await p.locator('#search-suggestions').boundingBox();
        assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
        await input.press('Escape');
        assert(await p.locator('#search-suggestions').isHidden());
        await input.fill('trays');
        await p.locator('#search-suggestions a[href*="categories/trays"]').waitFor();
        await input.fill('zzzzzzunknown');
        await p.waitForTimeout(150);
        assert((await p.locator('#search-suggestions').textContent()).includes('No suggestions'));
        await p.locator('h1').click();
        assert(await p.locator('#search-suggestions').isHidden());
        assert.equal(await p.locator('.mobile-product-enquiry').count(), 0);
        assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      }
      console.log('PASS live suggestions, thumbnails, categories, dismiss and layout ' + width);
    }
    await p.goto(url('index.html'));
    await p.locator('#search').fill('RIT-0268');
    await p.locator('#search-option-0').waitFor();
    await p.locator('#search').press('ArrowDown');
    assert.equal(
      await p.locator('#search').getAttribute('aria-activedescendant'),
      'search-option-0',
    );
    await p.locator('#search').press('Enter');
    await p.waitForURL(/products\/rit-0268/);
    await p.locator('#search').fill('trays');
    await p.locator('#search-suggestions a[href*="categories/trays"]').waitFor();
    await p.locator('#search-suggestions a[href*="categories/trays"]').click();
    await p.waitForURL(/categories\/trays/);
    await p.locator('#search').fill('box');
    await p.locator('#search').press('Enter');
    await p.waitForURL(/catalogue.html\?q=box/);
    assert.equal(await p.locator('#catalogue-query').inputValue(), 'box');
    assert.deepEqual(errors, []);
    const plain = await b.newPage({ javaScriptEnabled: false });
    await plain.goto(url('index.html'));
    await plain.locator('#search').fill('pump');
    await plain.locator('#search').press('Enter');
    await plain.waitForURL(/catalogue.html\?q=pump/);
    console.log(
      'PASS keyboard navigation, category selection, normal search and no-JavaScript submission',
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
