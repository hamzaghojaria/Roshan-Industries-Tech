const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const b = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await p.route('https://**/*', (r) => r.abort());
    const url = (f) => pathToFileURL(path.resolve(f)).href;
    await p.goto(url('products/rit-0268.html'));
    const image = p.locator('.product-image-open');
    await image.hover({ position: { x: 30, y: 30 } });
    await p.waitForTimeout(80);
    assert(await image.evaluate((el) => el.classList.contains('is-magnifying')));
    const transform = await image.locator('img').evaluate((el) => getComputedStyle(el).transform);
    assert(transform.startsWith('matrix(2.2'));
    const oldOrigin = await image.evaluate((el) => el.style.getPropertyValue('--magnifier-origin'));
    await image.hover({ position: { x: 150, y: 150 } });
    await p.waitForTimeout(80);
    assert.notEqual(
      await image.evaluate((el) => el.style.getPropertyValue('--magnifier-origin')),
      oldOrigin,
    );
    await p.mouse.move(1, 1);
    await p.waitForTimeout(80);
    assert(!(await image.evaluate((el) => el.classList.contains('is-magnifying'))));
    assert.equal(
      await image.locator('img').evaluate((el) => getComputedStyle(el).transform),
      'none',
    );
    await image.click();
    assert(await p.locator('.product-image-viewer').isVisible());
    await p.keyboard.press('Escape');
    console.log('PASS desktop cursor-following magnifier, reset and click viewer');
    await p.goto(url('catalogue.html'));
    await p.locator('.sidebar a[href="categories/screwdrivers.html"]').click();
    await p.waitForURL(/screwdrivers/);
    assert.equal(await p.locator('#arrival-filter').count(), 0);
    assert.equal(await p.locator('#sort').count(), 1);
    console.log('PASS category navigation without Show selector');
    const mobile = await b.newPage({
      viewport: { width: 390, height: 900 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    await mobile.route('https://**/*', (r) => r.abort());
    await mobile.goto(url('products/rit-0268.html'));
    await mobile.locator('.product-image-open').tap();
    assert(await mobile.locator('.product-image-viewer').isVisible());
    assert.equal(await mobile.locator('.product-image-open.is-magnifying').count(), 0);
    await mobile.locator('[data-viewer-close]').tap();
    assert.equal(
      await mobile
        .locator('.product-image-open img')
        .evaluate((el) => getComputedStyle(el).transform),
      'none',
    );
    await mobile.goto(url('categories/screwdrivers.html'));
    assert.equal(await mobile.locator('#arrival-filter').count(), 0);
    assert(!(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
    console.log('PASS touch image viewer without hover zoom and mobile category layout');
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
