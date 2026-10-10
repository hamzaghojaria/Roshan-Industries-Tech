const { chromium } = require('./helpers/browser.cjs');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
const routes = [
  'index.html',
  'about.html',
  'contact.html',
  'catalogue.html',
  'categories.html',
  'new-arrivals.html',
  'founder.html',
  'products/rit-0166.html',
  'categories/storage.html',
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('https://**/*', (route) => route.abort());
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(pathToFileURL(path.resolve(route)).href);
        await page.locator('.motion-enter').first().waitFor({ state: 'attached' });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          route,
        );
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => !document.querySelector('.banner-floating'));
        assert.equal(await page.locator('.banner-floating').count(), 0);
        assert.equal(
          await page.evaluate(() =>
            [...document.querySelectorAll('main *')].some(
              (el) => getComputedStyle(el).animationName !== 'none',
            ),
          ),
          false,
          route + ' reduced motion',
        );
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
    }
    await page.goto(pathToFileURL(path.resolve('catalogue.html')).href);
    await page.locator('.product-card').first().scrollIntoViewIfNeeded();
    await page.locator('.product-card.motion-enter').first().waitFor({ state: 'attached' });
    await page.locator('#pagination button').filter({ hasText: 'Next' }).click();
    await page.locator('.product-card').first().scrollIntoViewIfNeeded();
    await page.locator('.product-card.motion-enter').first().waitFor({ state: 'attached' });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(pathToFileURL(path.resolve('founder.html')).href);
    const slider = page.locator('[data-slider]').first();
    await slider.scrollIntoViewIfNeeded();
    await slider.locator('[data-slider-next]').click();
    await page.waitForFunction(
      () =>
        document.querySelector('.generation-card.is-current-slide') !==
        document.querySelector('.generation-card'),
    );
    assert.equal(errors.length, 0, errors.join('\n'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    assert.equal(await page.locator('.motion-enter,.banner-floating').count(), 0);
    console.log(
      'PASS motion across nine page types at mobile and desktop widths, dynamic product pagination, mobile slider selection and reduced-motion preferences.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
