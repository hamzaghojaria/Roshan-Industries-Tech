// Check the small image lift, removed zoom, touch behavior and reduced-motion fallback.
const { chromium } = require('./helpers/browser.cjs');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const url = (file) => pathToFileURL(path.resolve(__dirname, '..', file)).href;

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const mobile of [false, true]) {
      const page = await browser.newPage({
        viewport: { width: mobile ? 390 : 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
      });
      await page.route('https://**/*', (route) => route.abort());
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const file of ['products/rit-0001.html', 'products/rit-0268.html']) {
        await page.goto(url(file));
        const image = page.locator('.detail-image img');
        await image.evaluate((element) => element.decode());
        await image.scrollIntoViewIfNeeded();
        if (mobile) await image.tap();
        else await image.hover();
        await page.waitForFunction(() => {
          const image = document.querySelector('.detail-image img');
          const matrix = new DOMMatrix(getComputedStyle(image).transform);
          return matrix.a === 1 && Math.abs(matrix.f + 3) < 0.01;
        });
        assert.equal(await page.locator('.product-image-viewer, .product-image-open').count(), 0);
        assert.equal(await image.evaluate((element) => element.closest('a') === null), true);
        await image.click();
        assert.equal(page.url(), url(file));
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await image.hover();
        assert.equal(
          await image.evaluate((element) => getComputedStyle(element).transform),
          'none',
        );
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(
        `PASS product images: ${mobile ? 'mobile' : 'desktop'} lift, no zoom, reduced motion.`,
      );
    }
    const plain = await browser.newPage({ javaScriptEnabled: false });
    await plain.goto(url('products/rit-0001.html'));
    assert(await plain.locator('.detail-image img').isVisible());
    await plain.close();
    console.log('PASS product photograph remains visible without JavaScript.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('[product-images] FAIL:', error);
  process.exitCode = 1;
});
