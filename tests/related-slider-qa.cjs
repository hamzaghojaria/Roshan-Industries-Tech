// Regression check: related slider. Run after rebuilding the website.
const { chromium } = require('./helpers/browser.cjs');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const b = await chromium.launch({
    headless: true,
  });
  try {
    const p = await b.newPage({ reducedMotion: 'reduce' });
    await p.route('https://**/*', (r) => r.abort());
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    for (const width of [320, 390, 760, 1024, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(pathToFileURL(path.resolve('products/rit-0268.html')).href);
      const slider = p.locator('.related-slider'),
        track = slider.locator('.slider-track');
      await slider.scrollIntoViewIfNeeded();
      assert.equal(await track.locator('.product-card').count(), 4);
      if (width <= 760) {
        assert(await slider.locator('.slider-controls').isVisible());
        assert(await track.evaluate((el) => el.scrollWidth > el.clientWidth));
        await slider.locator('[data-slider-next]').click();
        await p.waitForTimeout(100);
        assert((await track.evaluate((el) => el.scrollLeft)) > 0);
        assert.equal(await slider.locator('.slider-position').textContent(), '2 / 4');
        await track.focus();
        await p.keyboard.press('ArrowRight');
        await p.waitForTimeout(100);
        assert.equal(await slider.locator('.slider-position').textContent(), '3 / 4');
        await p.screenshot({ path: 'artifacts/qa/mobile-related-' + width + '.png' });
      } else {
        assert(await slider.locator('.slider-controls').isHidden());
        assert.equal(await track.evaluate((el) => getComputedStyle(el).display), 'grid');
        assert(await track.evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
      }
      assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      console.log('PASS related products mobile slider and desktop grid ' + width);
    }
    assert.deepEqual(errors, []);
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
