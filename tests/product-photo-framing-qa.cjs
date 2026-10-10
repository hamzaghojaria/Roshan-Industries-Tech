// Ensure selective photo framing never clips the fitting or stretches its proportions.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./helpers/browser.cjs');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'products.js'), 'utf8'), context);
// Pixel detection assumes the white backgrounds of the precision fitting photographs.
const products = context.window.ROSHAN_PRODUCTS.filter(
  (p) => p.imageFrame && p.family === 'Precision Machining',
);
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--allow-file-access-from-files'],
  });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.route('https://**/*', (r) => r.abort());
      for (const p of products) {
        await page.goto(pathToFileURL(path.join(root, p.url)).href);
        const result = await page.locator('.detail-image img').evaluate(async (i, frame) => {
          await i.decode();
          const c = document.createElement('canvas');
          c.width = i.naturalWidth;
          c.height = i.naturalHeight;
          const ctx = c.getContext('2d');
          ctx.drawImage(i, 0, 0);
          const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
          let clipped = 0;
          for (let y = 0; y < c.height; y++) {
            for (let x = 0; x < c.width; x++) {
              const k = (y * c.width + x) * 4;
              if (
                pixels[k + 3] > 200 &&
                Math.min(...pixels.slice(k, k + 3)) < 235 &&
                (x < frame.x || x > frame.x + frame.size || y < frame.y || y > frame.y + frame.size)
              )
                clipped++;
            }
          }
          const r = i.getBoundingClientRect();
          const box = i.parentElement.getBoundingClientRect();
          return {
            clipped,
            aspect: r.width / r.height,
            natural: c.width / c.height,
            square: Math.abs(box.width - box.height),
            overflow: getComputedStyle(i.parentElement).overflow,
          };
        }, p.imageFrame);
        assert.equal(result.clipped, 0, p.sku + ': clipped product pixels');
        assert(Math.abs(result.aspect - result.natural) < 0.002, p.sku + ': stretched photo');
        assert(result.square < 1, p.sku + ': uneven frame');
        assert.equal(result.overflow, 'hidden');
      }
      await page.close();
      console.log(
        `PASS ${products.length} individually framed photos at ${width}px: full product visible, original proportions.`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
