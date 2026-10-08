// Regression check: final arrivals. Run after rebuilding the website.
const fs = require('node:fs'),
  assert = require('node:assert/strict'),
  path = require('node:path'),
  crypto = require('node:crypto');
const { chromium } = require('./helpers/browser.cjs');
const { pathToFileURL } = require('node:url');
(async () => {
  const products = JSON.parse(fs.readFileSync('src/data/online-products.json', 'utf8')).filter(
    (p) => Number(p.sku.slice(4)) >= 260,
  );
  assert.equal(products.length, 64);
  assert(
    products.some((product) => product.sku === 'RIT-0269' && product.categoryId === 'case-openers'),
  );
  const pdfReport = JSON.parse(
    fs.readFileSync('reports/high-resolution-audit/branded-catalogue-validation.json', 'utf8'),
  );
  assert.equal(
    crypto
      .createHash('sha256')
      .update(fs.readFileSync('assets/roshan-industries-catalogue.pdf'))
      .digest('hex'),
    pdfReport.pdfSha256,
  );
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
        assert.equal(await page.locator('.product-catalogue-actions .button').count(), 2);
        assert.equal(
          await page.getByRole('link', { name: /Explore in catalogue/ }).getAttribute('href'),
          '../assets/roshan-industries-catalogue.pdf#page=' + pdfReport.skuPages[p.sku],
        );
        assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
        await page.goto(pathToFileURL(path.resolve('catalogue.html')).href + '?q=' + p.sku);
        assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
        assert.equal(await page.locator('#catalogue-grid .arrival-badge').count(), 1);
      }
    }
    console.log(
      `PASS ${products.length} recent linked products, image decoding, shared badges, SKU search, responsive detail pages and synchronized PDF and Excel.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
