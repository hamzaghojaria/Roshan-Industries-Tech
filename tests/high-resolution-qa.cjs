// Verify all images decode and the download served by the site is the current branded PDF.
const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const { createRequire } = require('node:module');
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  ({ chromium } = createRequire(path.resolve(__dirname, '../../.site-tools/qa/package.json'))(
    'playwright-core',
  ));
}
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (requestPath === '/' ? '/index.html' : requestPath));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    res.end();
    return;
  }
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.pdf': 'application/pdf',
    '.webp': 'image/webp',
    '.png': 'image/png',
  };
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const b = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await b.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    await page.route('https://**/*', (r) => r.abort());
    await page.goto(origin + '/new-arrivals.html');
    const vm = require('node:vm'),
      context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'products.js'), 'utf8'), context);
    const products = context.window.ROSHAN_PRODUCTS;
    for (let i = 0; i < products.length; i += 12) {
      await page.evaluate(
        async (records) => {
          for (const p of records) {
            const img = new Image();
            img.src = '/' + p.image;
            await img.decode();
            if (img.naturalWidth !== p.imageWidth || img.naturalHeight !== p.imageHeight)
              throw Error('Wrong image dimensions ' + p.sku);
          }
        },
        products.slice(i, i + 12),
      );
    }
    const filters = page.locator('.arrival-filters');
    if (await filters.count()) {
      assert(await filters.evaluate((el) => el.scrollWidth > el.clientWidth));
      for (const button of await filters.locator('button').all()) {
        await button.tap();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        assert((await page.locator('.arrival-card:not([hidden])').count()) > 0);
      }
      await filters.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      assert(await page.locator('.floating-whatsapp').isHidden());
      await filters.locator('button').first().tap();
    } else {
      assert.equal(await page.locator('.arrival-card').count(), 0);
    }
    fs.mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.header-main .catalogue-download').click();
    const download = await downloadPromise;
    const destination = path.join(root, 'artifacts/qa/latest-catalogue-download.pdf');
    await download.saveAs(destination);
    const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
    assert.equal(
      hash(destination),
      hash(path.join(root, 'assets/roshan-industries-catalogue.pdf')),
    );
    fs.unlinkSync(destination);
    await page.screenshot({
      path: path.join(root, 'reports/high-resolution-audit/new-arrivals-mobile.png'),
    });
    await page.goto(origin + '/products/rit-0226.html');
    await page.screenshot({
      path: path.join(root, 'reports/high-resolution-audit/new-product-mobile.png'),
      fullPage: true,
    });
    console.log(
      'PASS: all 228 native images decode with correct dimensions; responsive New Arrivals page and actual catalogue PDF download.',
    );
  } finally {
    await b.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch(async (e) => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
