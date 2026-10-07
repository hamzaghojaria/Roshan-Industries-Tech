let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  ({ chromium } = require('../../.site-tools/qa/node_modules/playwright-core'));
}
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const arrivalCount = JSON.parse(
    require('node:fs').readFileSync('src/data/new-arrivals.json', 'utf8'),
  ).skus.length;
  const b = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const p = await b.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.route('https://**/*', (r) => r.abort());
  for (const width of [320, 390, 760, 1024, 1440]) {
    await p.setViewportSize({ width, height: 900 });
    await p.goto(pathToFileURL(path.resolve('new-arrivals.html')).href);
    assert.equal(await p.locator('.arrival-card').count(), arrivalCount);
    for (const filter of await p.locator('[data-arrival-filter]').all()) {
      await filter.click();
      const id = await filter.getAttribute('data-arrival-filter');
      const visible = p.locator('.arrival-card:not([hidden])');
      assert((await visible.count()) > 0);
      if (id !== 'all')
        for (const card of await visible.all())
          assert.equal(await card.getAttribute('data-arrival-category'), id);
    }
    if (arrivalCount) await p.locator('[data-arrival-filter="all"]').click();
    else assert.equal(await p.locator('[data-arrival-filter]').count(), 0);
    assert.equal(await p.locator('.arrival-card:not([hidden])').count(), arrivalCount);
    assert(
      !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
      'Arrival overflow ' + width,
    );
    assert.equal(
      await p
        .locator('nav[aria-label="Main navigation"] [aria-current="page"]')
        .textContent()
        .then((t) => t.trim()),
      'New Arrivals',
    );
    for (const img of await p.locator('.arrival-card img').all()) {
      await img.scrollIntoViewIfNeeded();
      assert(await img.evaluate((el) => el.complete && el.naturalWidth > 0), 'Broken image');
    }
    await p.goto(pathToFileURL(path.resolve('index.html')).href);
    assert.equal(await p.locator('.home-arrivals .arrival-card').count(), 0);
    assert(
      !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
      'Home overflow ' + width,
    );
    console.log('PASS arrivals filters, images, active navigation and homepage at ' + width + 'px');
  }
  assert.deepEqual(errors, []);
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
