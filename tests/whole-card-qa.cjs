const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const b = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const p = await b.newPage({ reducedMotion: 'reduce' });
    await p.route('https://**/*', (r) => r.abort());
    for (const width of [390, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      for (const file of [
        'catalogue.html',
        'new-arrivals.html',
        'categories/screwdrivers.html',
        'products/rit-0268.html',
      ]) {
        await p.goto(pathToFileURL(path.resolve(file)).href);
        const card = p.locator('.product-card').first();
        const href = await card.locator('h3 a').getAttribute('href');
        const expected = new URL(href, p.url()).href;
        await card.click({ position: { x: 4, y: 4 } });
        await p.waitForURL(expected);
        assert.equal(p.url(), expected);
        console.log('PASS whole card link ' + width + ' ' + file);
      }
      await p.goto(pathToFileURL(path.resolve('catalogue.html')).href);
      const category = p.locator('.product-card .product-category').first();
      const expected = new URL(
        await p.locator('.product-card h3 a').first().getAttribute('href'),
        p.url(),
      ).href;
      await category.scrollIntoViewIfNeeded();
      const categoryBounds = await category.boundingBox();
      await p.mouse.click(
        categoryBounds.x + categoryBounds.width / 2,
        categoryBounds.y + categoryBounds.height / 2,
      );
      await p.waitForURL(expected);
      assert.equal(p.url(), expected);
    }
    const plain = await b.newPage({ javaScriptEnabled: false });
    await plain.goto(pathToFileURL(path.resolve('catalogue.html')).href);
    const card = plain.locator('.product-card').first();
    const expected = new URL(await card.locator('h3 a').getAttribute('href'), plain.url()).href;
    await card.click({ position: { x: 4, y: 4 } });
    await plain.waitForURL(expected);
    console.log('PASS category labels open products and no-JavaScript whole-card link');
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
