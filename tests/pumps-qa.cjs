// Verify the expanded pump family, photograph loading and responsive enquiry pages.
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  ({ chromium } = createRequire(path.resolve(__dirname, '../../.site-tools/qa/package.json'))(
    'playwright-core',
  ));
}

(async () => {
  const root = path.resolve(__dirname, '..');
  const records = JSON.parse(
    fs
      .readFileSync(path.join(root, 'products.js'), 'utf8')
      .split('window.ROSHAN_PRODUCTS =')[1]
      .trim()
      .replace(/;$/, ''),
  );
  const pumps = records.filter((p) => p.onlineRange);
  assert.equal(pumps.length, 12);
  assert.equal(new Set(pumps.map((p) => p.image)).size, 12);
  const categories = [...new Set(pumps.map((p) => p.categoryId))];
  assert.equal(categories.length, 6);
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', (route) => route.abort());
    const url = (file) => pathToFileURL(path.join(root, file)).href;
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const product of pumps) {
        await page.goto(url(product.url), { waitUntil: 'domcontentloaded' });
        const photo = page.locator(`img[src="../${product.image}"]`);
        await photo.evaluate(async (img) => {
          img.loading = 'eager';
          await img.decode();
        });
        assert(await photo.evaluate((img) => img.naturalWidth > 0));
        assert.equal(await page.locator('.image-credit').count(), 0);
        assert.equal(await page.locator('a.footer-photo-credits').count(), 0);
        assert(
          await page
            .locator('.product-note')
            .innerText()
            .then((text) => text.includes('reference photograph')),
        );
        const wa = page.locator('.enquiry-actions a[href^="https://wa.me/"]');
        assert(decodeURIComponent(await wa.getAttribute('href')).includes(product.sku));
        assert(
          !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `${product.sku} overflow at ${width}`,
        );
      }
      for (const category of categories) {
        await page.goto(url(`categories/${category}.html`), { waitUntil: 'domcontentloaded' });
        assert.equal(
          await page.locator('#catalogue-grid .product-card:visible').count(),
          pumps.filter((p) => p.categoryId === category).length,
        );
        assert(
          !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `${category} overflow at ${width}`,
        );
      }
      await page.goto(url('catalogue.html') + '?family=Pumps', { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#catalogue-grid .product-card:visible').count(), 12);
    }
    fs.mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
    await page.goto(url('catalogue.html') + '?family=Pumps', { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: path.join(root, 'artifacts/qa/pumps-desktop.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url(pumps[0].url), { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      path: path.join(root, 'artifacts/qa/pump-mobile.png'),
      fullPage: true,
    });
    console.log(
      'PASS: 12 unique pump photos decode, six category counts, family filtering, SKU enquiries and responsive layouts at 320/390/1440px.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
