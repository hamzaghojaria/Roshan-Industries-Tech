const { chromium } = require('../../.site-tools/qa/node_modules/playwright-core');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const p = await browser.newPage({ reducedMotion: 'reduce' });
    await p.route('https://**/*', (r) => r.abort());
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const url = (file) => pathToFileURL(path.resolve(file)).href;
    for (const width of [320, 390, 760, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(url('catalogue.html') + '?family=Workshop%20Essentials&sort=new&q=box');
      assert((await p.locator('#browsing-context').textContent()).includes('Workshop Essentials'));
      await p.locator('#browsing-context button').click();
      assert(await p.locator('#browsing-context').isHidden());
      assert(!new URL(p.url()).searchParams.has('family'));
      assert.equal(await p.locator('#sort').inputValue(), 'new');
      assert.equal(await p.locator('#catalogue-query').inputValue(), 'box');
      await p.goto(url('categories/trays-storage.html') + '?sort=asc&q=tin');
      assert((await p.locator('#browsing-context').textContent()).includes('Trays'));
      assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      await p.locator('#browsing-context a').click();
      await p.waitForURL(/catalogue.html/);
      assert.equal(await p.locator('#catalogue-query').inputValue(), 'tin');
      assert.equal(await p.locator('#sort').inputValue(), 'asc');
      await p.goto(url('new-arrivals.html') + '?category=holders-stands');
      assert((await p.locator('#arrival-context').textContent()).includes('Holders'));
      await p.locator('#arrival-context button').click();
      assert(await p.locator('#arrival-context').isHidden());
      assert.equal(await p.locator('.arrival-card').count(), 24);
      assert(!new URL(p.url()).searchParams.has('category'));
      assert(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      console.log('PASS clear selection chips and preserved search/sort ' + width);
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
