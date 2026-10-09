const fs = require('fs'),
  path = require('path'),
  http = require('http'),
  os = require('os'),
  crypto = require('crypto'),
  assert = require('assert/strict');
const { chromium } = require('./helpers/browser.cjs');
(async () => {
  const root = path.resolve('dist');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'roshan-download-'));
  const server = http.createServer((req, res) => {
    const file = path.resolve(
      root,
      '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname),
    );
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
      res.writeHead(404);
      return res.end();
    }
    const ext = path.extname(file);
    res.setHeader(
      'Content-Type',
      {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.pdf': 'application/pdf',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
      }[ext] || 'application/octet-stream',
    );
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/catalogue.html');
      for (const [text, file] of [
        ['Download PDF catalogue', 'assets/roshan-industries-catalogue.pdf'],
        ['Download Excel catalogue', 'Roshan-Industries-Product-Catalogue.xlsx'],
      ]) {
        const button = page.getByRole('link', { name: text, exact: true });
        const box = await button.boundingBox();
        assert(box.height >= 44 && box.x >= 0 && box.x + box.width <= width + 1);
        const pending = page.waitForEvent('download');
        await button.click();
        const download = await pending;
        const saved = path.join(temp, width + '-' + path.basename(file));
        await download.saveAs(saved);
        assert.equal(await download.failure(), null);
        assert.equal(sha(saved), sha(path.join(root, file)));
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    const records = JSON.parse(
      fs
        .readFileSync('products.js', 'utf8')
        .split('window.ROSHAN_PRODUCTS =')[1]
        .trim()
        .replace(/;$/, ''),
    );
    for (const family of [...new Set(records.map((p) => p.family))]) {
      const product = records.find((p) => p.family === family);
      await page.goto(base + '/' + product.url);
      const mail = await page
        .locator('.enquiry-actions a[href^="mailto:"]')
        .first()
        .getAttribute('href');
      const wa = await page
        .locator('.enquiry-actions a[href^="https://wa.me"]')
        .first()
        .getAttribute('href');
      assert(decodeURIComponent(mail).includes(product.sku));
      assert(decodeURIComponent(wa).includes(product.sku));
      const pdf = await page.locator('.product-catalogue-actions a[download]').getAttribute('href');
      const response = await fetch(new URL(pdf, page.url()));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/pdf');
      await response.arrayBuffer();
    }
    console.log(
      'PASS HTTP mobile downloads: PDF/XLSX clicks at 320/390px match published files; enquiries and PDFs work across all 5 product families',
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
    assert(temp.startsWith(os.tmpdir() + path.sep));
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
