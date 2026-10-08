// Browser regression checks: navigation, all categories, search and pagination.
// Use an installed test dependency, with the retained portable tooling as a fallback.
const { chromium } = require('./helpers/browser.cjs');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
let browser;
(async () => {
  const root = path.resolve(__dirname, '..');
  const sandbox = { window: {} };
  require('node:vm').runInNewContext(
    fs.readFileSync(path.join(root, 'products.js'), 'utf8'),
    sandbox,
  );
  const products = sandbox.window.ROSHAN_PRODUCTS;
  require('node:fs').mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
  const url = (file) => pathToFileURL(path.join(root, file)).href;
  browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // External map availability must not delay local catalogue interaction checks.
  await page.route('https://www.google.com/maps**', (route) => route.abort());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url('index.html'));
  await page.screenshot({ path: path.join(root, 'artifacts/qa/new-home.png') });
  await page.locator('#search').fill('RIT-0001');
  await page.locator('.header-search button').click();
  await page.waitForURL(/catalogue\.html\?q=RIT-0001/);
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
  await page.locator('#catalogue-grid h3 a').click();
  await page.waitForURL(/products\/rit-0001\.html/);
  assert.equal(await page.locator('.detail-sku').textContent(), 'SKU RIT-0001');
  const email = await page.locator('.detail-copy a[href^="mailto:"]').getAttribute('href');
  assert.match(decodeURIComponent(email), /SKU: RIT-0001/);
  await page.screenshot({ path: path.join(root, 'artifacts/qa/new-product.png') });
  assert.equal(
    await page.locator('header .brand img').getAttribute('src'),
    await page.locator('footer .brand img').getAttribute('src'),
  );
  await page.goto(url('catalogue.html'));
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 24);
  assert.equal(await page.locator('#pagination button[aria-label^="Page "]').count(), 3);
  assert.equal(await page.locator('.pagination-ellipsis').count(), 1);
  // Next traverses every page even though only three page numbers are shown.
  for (let current = 2; current <= Math.ceil(products.length / 24); current++) {
    await page
      .locator('#pagination button')
      .filter({ hasText: /^Next$/ })
      .click();
    assert.equal(
      await page.locator('#pagination [aria-current="page"]').textContent(),
      String(current),
    );
    assert.equal(await page.locator('#pagination button[aria-label^="Page "]').count(), 3);
  }
  assert(
    await page
      .locator('#pagination button')
      .filter({ hasText: /^Next$/ })
      .isDisabled(),
  );
  await page.goto(url('catalogue.html'));
  await page.locator('[data-page="2"]').first().click();
  assert.match(await page.locator('#results-count').textContent(), /Showing 25–48/);
  await page.locator('#catalogue-query').fill('glass fitting');
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 11);
  assert.equal(await page.locator('#search').inputValue(), '');
  await page.reload();
  assert.equal(await page.locator('#catalogue-query').inputValue(), 'glass fitting');
  assert.equal(await page.locator('#search').inputValue(), '');
  await page.locator('#search').fill('clock');
  await page.locator('#catalogue-query').fill('no-such-product-zzz');
  assert.equal(await page.locator('#search').inputValue(), 'clock');
  assert.equal(await page.locator('#empty-state').isVisible(), true);
  await page.locator('#reset-search').click();
  assert.equal(await page.locator('#search').inputValue(), 'clock');
  await page.locator('#sort').selectOption('desc');
  assert.match(await page.locator('#catalogue-grid h3').first().textContent(), /Yellow Tweezer/);
  // Family selection composes with search, survives reload, and shows the correct totals.
  await page.goto(url('catalogue.html'));
  for (const [family, total] of [
    ['Watchmaking', products.filter((product) => product.family === 'Watchmaking').length],
    ['Clockmaking', 36],
    ['Jewellery', 21],
    ['Workshop Essentials', products.filter((p) => p.family === 'Workshop Essentials').length],
    ['Precision Machining', 25],
  ]) {
    await page.goto(url('catalogue.html') + '?family=' + encodeURIComponent(family));
    assert.equal(await page.locator('#family-filter').count(), 0);
    assert.match(
      await page.locator('#results-count').textContent(),
      new RegExp(`of ${total} products$`),
    );
    assert.equal(new URL(page.url()).searchParams.get('family'), family);
  }
  await page.reload();
  assert.equal(new URL(page.url()).searchParams.get('family'), 'Precision Machining');
  await page.goto(url('catalogue.html') + '?family=Watchmaking');
  await page.locator('#catalogue-query').fill('RIT-0001');
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
  await page.goto(url('catalogue.html') + '?family=Clockmaking&q=RIT-0001');
  assert.equal(await page.locator('#empty-state').isVisible(), true);
  await page.locator('#reset-search').click();
  assert.match(await page.locator('#results-count').textContent(), /of 36 products$/);
  await page.goto(url('categories/screwdrivers.html'));
  assert.equal(await page.locator('#family-filter').count(), 0);
  assert.equal(
    await page.locator('#primary-navigation [aria-current="page"]').textContent(),
    'Products',
  );
  assert.equal(await page.locator('.sidebar-family').count(), 5);
  assert.equal(await page.locator('#category-jump optgroup').count(), 5);
  for (const file of fs.readdirSync(path.join(root, 'categories'))) {
    await page.goto(url('categories/' + file));
    assert((await page.locator('#catalogue-grid .product-card').count()) > 0);
    assert.equal(await page.locator('.sidebar [aria-current="page"]').count(), 1);
  }
  await page.goto(url('categories.html'));
  assert.equal(await page.locator('.category-card').count(), 17);
  assert.equal(await page.locator('.family-overview a').count(), 5);
  assert.equal(await page.locator('.family-heading').count(), 5);
  assert.equal(
    (await page.locator('#family-watchmaking .family-count span').textContent())
      .replace(/\s+/g, ' ')
      .trim(),
    `6 categories ${String.fromCharCode(183)} ${products.filter((product) => product.family === 'Watchmaking').length} products`,
  );
  await page.locator('.family-overview a').first().click();
  assert.match(page.url(), /#family-watchmaking$/);
  await page.screenshot({ path: path.join(root, 'artifacts/qa/new-categories.png') });
  for (const file of [
    'index.html',
    'categories.html',
    'categories/screwdrivers.html',
    'products/rit-0001.html',
    'about.html',
    'contact.html',
  ]) {
    await page.goto(url(file));
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
        `Overflow: ${file} at ${width}`,
      );
    }
    await page.addStyleTag({ content: 'html { font-size:200%; }' });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      if (overflow)
        console.log(
          await page.evaluate(() =>
            [...document.querySelectorAll('body *')]
              .filter(
                (el) =>
                  el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('.nav-links'),
              )
              .map((el) => ({
                cls: el.className,
                text: el.textContent.slice(0, 60),
                right: el.getBoundingClientRect().right,
              }))
              .slice(0, 10),
          ),
        );
      assert.equal(overflow, false, `200% overflow: ${file} at ${width}`);
    }
  }
  await page.goto(url('index.html'));
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: path.join(root, 'artifacts/qa/new-mobile.png') });
  await page.goto(url('categories/clock-keys.html'));
  await page.locator('#category-jump').selectOption('../categories/screwdrivers.html');
  await page.waitForURL(/categories\/screwdrivers\.html/);
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 13);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: family filters and totals, reload/search combinations, category-to-family navigation, all categories, pagination, sorting and 200% text enlargement.',
  );
  await browser.close();
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  process.exitCode = 1;
});
