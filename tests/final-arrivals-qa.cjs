const fs = require('node:fs'),
  assert = require('node:assert/strict'),
  path = require('node:path'),
  crypto = require('node:crypto');
const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const { pathToFileURL } = require('node:url');
(async () => {
  const products = JSON.parse(fs.readFileSync('src/data/online-products.json', 'utf8')).filter(
    (p) => Number(p.sku.slice(4)) >= 260,
  );
  assert.equal(products.length, 8);
  const latestBatch = JSON.parse(
    fs.readFileSync('reports/high-resolution-audit/third-link-arrivals.json', 'utf8'),
  );
  for (const [file, expected] of Object.entries(latestBatch.frozenExports)) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expected);
  }
  const exportReport = JSON.parse(
    fs.readFileSync('reports/high-resolution-audit/workbook-validation.json', 'utf8'),
  );
  assert.equal(
    crypto
      .createHash('sha256')
      .update(fs.readFileSync('Roshan-Industries-Product-Catalogue.xlsx'))
      .digest('hex'),
    exportReport.xlsxSha256,
  );
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', (r) => r.abort());
    for (const width of [320, 390, 760, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const p of products) {
        await page.goto(pathToFileURL(path.resolve(p.url)).href);
        await page.locator('.detail-image img').evaluate((el) => el.decode());
        assert.equal(await page.locator('.arrival-badge-detail').count(), 1);
        assert.equal(await page.locator('.product-catalogue-actions .button').count(), 1);
        assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
        await page.goto(pathToFileURL(path.resolve('catalogue.html')).href + '?q=' + p.sku);
        assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
        assert.equal(await page.locator('#catalogue-grid .arrival-badge').count(), 1);
      }
    }
    console.log(
      'PASS eight recent linked products, image decoding, shared badges, SKU search, responsive detail pages and unchanged PDF and Excel.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
