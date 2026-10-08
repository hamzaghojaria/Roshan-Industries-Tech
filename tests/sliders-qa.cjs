// Exercise real carousel movement, pause, reduced motion and mobile geometry.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { chromium } = require('./helpers/browser.cjs');
(async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  const home = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route('https://**/*', (r) => r.abort());
    await page.goto(home, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('[data-slider]').count(), 2);
    for (const slider of await page.locator('[data-slider]').all()) {
      await slider.scrollIntoViewIfNeeded();
      await page.waitForTimeout(5500);
      assert(
        await slider.locator('.slider-track').evaluate((el) => el.scrollLeft > 10),
        'Autoplay did not move a visible slider',
      );
    }
    for (const width of [320, 390, 760, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const slider of await page.locator('[data-slider]').all()) {
        const track = slider.locator('.slider-track');
        await track.evaluate((el) => el.scrollTo({ left: 0, behavior: 'instant' }));
        await slider.locator('[data-slider-next]').click();
        await page.waitForTimeout(650);
        assert(await track.evaluate((el) => el.scrollLeft > 10), `Next did not move at ${width}`);
        await slider.locator('[data-slider-prev]').click();
        await page.waitForTimeout(650);
        assert(
          await track.evaluate((el) => el.scrollLeft < 2),
          `Previous did not return at ${width}`,
        );
        await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
        // Native snapping settles between separate user actions.
        await page.waitForTimeout(500);
        await slider.locator('[data-slider-next]').click();
        await page.waitForFunction((el) => el.scrollLeft < 2, await track.elementHandle(), {
          timeout: 3000,
        });
        assert(await track.evaluate((el) => el.scrollLeft < 2), `Wrap failed at ${width}`);
      }
      assert(
        !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
        `Page overflow at ${width}`,
      );
    }
    const reduced = await browser.newPage({
      reducedMotion: 'reduce',
      viewport: { width: 390, height: 844 },
    });
    await reduced.route('https://**/*', (r) => r.abort());
    await reduced.goto(home, { waitUntil: 'domcontentloaded' });
    const first = reduced.locator('[data-slider]').first();
    await first.scrollIntoViewIfNeeded();
    assert.equal(await first.locator('[data-slider-pause]').count(), 0);
    await reduced.waitForTimeout(5500);
    assert.equal(await first.locator('.slider-track').evaluate((el) => el.scrollLeft), 0);
    await first.locator('[data-slider-next]').click();
    assert(await first.locator('.slider-track').evaluate((el) => el.scrollLeft > 0));
    const plain = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await plain.route('https://**/*', (r) => r.abort());
    await plain.goto(home, { waitUntil: 'domcontentloaded' });
    assert.equal(await plain.locator('.slider-controls:visible').count(), 0);
    assert.equal(
      await plain
        .locator('.slider-track')
        .first()
        .evaluate((el) => getComputedStyle(el).overflowX),
      'auto',
    );
    console.log(
      'PASS: two automatic sliders, responsive controls/wrapping, reduced motion and native no-JavaScript scrolling.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
