// Check the approved ZIP/link inventory, synchronized exports and new product enquiry flows.
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const products = JSON.parse(fs.readFileSync('src/data/online-products.json', 'utf8')).filter(
  (p) => Number(p.sku.slice(4)) <= 259,
);
const audit = JSON.parse(
  fs.readFileSync('reports/high-resolution-audit/october-new-arrivals.json', 'utf8'),
);
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  assert.equal(products.length, 31);
  assert.deepEqual(
    products.map((p) => p.sku),
    Array.from({ length: 31 }, (_, i) => `RIT-${String(i + 229).padStart(4, '0')}`),
  );
  assert.deepEqual(
    new Set(products.filter((p) => p.sourcePhotoNumber).map((p) => p.sourcePhotoNumber)),
    new Set(Array.from({ length: 31 }, (_, i) => i + 1).filter((i) => i !== 5)),
  );
  assert.equal(products.filter((p) => p.imageEdited).length, 7);
  const pdfDesign = JSON.parse(
    fs.readFileSync('reports/high-resolution-audit/branded-catalogue-validation.json', 'utf8'),
  );
  const workbook = JSON.parse(
    fs.readFileSync('reports/high-resolution-audit/workbook-validation.json', 'utf8'),
  );
  assert.equal(sha('assets/roshan-industries-catalogue.pdf'), pdfDesign.pdfSha256);
  assert.equal(sha('Roshan-Industries-Product-Catalogue.xlsx'), workbook.xlsxSha256);
  for (const p of products) {
    assert.equal(sha(p.image), p.imageSha256);
    assert(!p.exportPending && p.onlineProduct && p.newArrival);
    assert(!/[\\/|*#@!~^<>{}\[\]]/.test(p.name + p.description));
    const html = fs.readFileSync(p.url, 'utf8');
    assert(!/Page undefined|#page=undefined/.test(html));
    assert(html.includes('Explore in catalogue'));
    assert(html.includes('Download catalogue'));
    for (const spec of p.specifications) assert(html.includes(spec.value));
  }
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', (r) => r.abort());
    const url = (file) => pathToFileURL(path.resolve(file)).href;
    for (const width of [320, 390, 760, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const p of [products[0], products[4], products[24]]) {
        await page.goto(url(p.url));
        const image = page.locator('.detail-image img');
        await image.evaluate((el) => el.decode());
        assert(await image.evaluate((el) => el.naturalWidth > 0));
        const actions = page.locator('.product-catalogue-actions .button');
        assert.equal(await actions.count(), 2);
        const group = await page.locator('.enquiry-actions').boundingBox(),
          download = await page.locator('.product-catalogue-actions').boundingBox();
        assert(
          Math.abs(group.x - download.x) < 1 && Math.abs(group.width - download.width) < 1,
          'Download button alignment',
        );
        assert(download.height >= 44);
        assert.equal(await page.locator('.arrival-badge-detail').count(), 1);
        assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      }
    }
    await page.goto(url('catalogue.html') + '?q=20x1');
    assert.equal(await page.locator('#catalogue-grid .product-card').count(), 2);
    await page.goto(url('catalogue.html') + '?q=150%20ml');
    assert.equal(await page.locator('#catalogue-grid .product-card').count(), 1);
    assert.equal(await page.locator('#catalogue-grid .sku').textContent(), 'RIT-0251');
    for (const [id, count] of [
      ['holders-stands', 1],
      ['trays-storage', 30],
    ]) {
      await page.goto(url(`categories/${id}.html`) + '?q=RIT-02');
      // The New badges follow the visible listing records, including pagination.
      const html = fs.readFileSync(`categories/${id}.html`, 'utf8');
      const allOnline = JSON.parse(fs.readFileSync('src/data/online-products.json', 'utf8'));
      assert.equal(
        (html.match(/class="arrival-badge">New/g) || []).length,
        allOnline.filter((p) => p.categoryId === id).length,
      );
    }
    const screenshot = path.resolve('artifacts/qa/october-arrivals-desktop.png');
    await page.goto(url('new-arrivals.html'));
    await page.screenshot({ path: screenshot });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url(products[0].url));
    await page.screenshot({
      path: path.resolve('artifacts/qa/october-stand-mobile.png'),
      fullPage: true,
    });
    console.log(
      'PASS 31 source references, stable SKUs, photos, synchronized PDF/XLSX, search by model/capacity, category badges and responsive enquiry/catalogue flows.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
