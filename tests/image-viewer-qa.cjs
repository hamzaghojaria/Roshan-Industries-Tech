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
    const p = await b.newPage({ reducedMotion: 'reduce', hasTouch: true });
    await p.route('https://**/*', (r) => r.abort());
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    for (const width of [320, 390, 760, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(pathToFileURL(path.resolve('products/rit-0268.html')).href);
      const trigger = p.locator('.product-image-open');
      await trigger.click();
      const dialog = p.locator('.product-image-viewer');
      assert(await dialog.isVisible());
      await p.locator('.viewer-canvas img').evaluate((img) => img.decode());
      assert.equal(await p.locator('.viewer-status').textContent(), '100%');
      await p.locator('[data-viewer-in]').click();
      assert.equal(await p.locator('.viewer-status').textContent(), '150%');
      await p.locator('[data-viewer-reset]').click();
      assert.equal(await p.locator('.viewer-status').textContent(), '100%');
      assert(await p.locator('[data-viewer-prev]').isHidden());
      const bounds = await dialog.boundingBox();
      assert(
        bounds.x >= 0 &&
          bounds.x + bounds.width <= width + 1 &&
          bounds.y >= 0 &&
          bounds.y + bounds.height <= 900,
      );
      await p.keyboard.press('+');
      assert.equal(await p.locator('.viewer-status').textContent(), '150%');
      await p.keyboard.press('Escape');
      assert(!(await dialog.isVisible()));
      assert(await trigger.evaluate((el) => el === document.activeElement));
      assert.equal(await p.evaluate(() => document.body.style.overflow), '');
      await trigger.click();
      await p.locator('[data-viewer-close]').click();
      assert(!(await dialog.isVisible()));
      console.log('PASS image viewer, zoom, keyboard, close, focus and layout ' + width);
    }
    await p.setViewportSize({ width: 390, height: 900 });
    await p.locator('.product-image-open').click();
    const box = await p.locator('.viewer-stage').boundingBox();
    const cdp = await p.context().newCDPSession(p);
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: x - 30, y, id: 1 },
        { x: x + 30, y, id: 2 },
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: x - 70, y, id: 1 },
        { x: x + 70, y, id: 2 },
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert(parseInt(await p.locator('.viewer-status').textContent()) > 100);
    await p.locator('[data-viewer-close]').click();
    assert.deepEqual(errors, []);
    console.log('PASS mobile pinch zoom');
    const plain = await b.newPage({ javaScriptEnabled: false });
    await plain.goto(pathToFileURL(path.resolve('products/rit-0268.html')).href);
    assert((await plain.locator('.product-image-open').getAttribute('href')).endsWith('.webp'));
    assert(!(await plain.locator('.product-image-viewer').isVisible()));
    console.log('PASS full image link without JavaScript');
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
