// Check the hero category destination and both custom-manufacturing header anchors.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { chromium } = require('./helpers/browser.cjs');
(async () => {
  const root = path.resolve(__dirname, '..');
  const url = (file) => pathToFileURL(path.join(root, file)).href;
  const destination = 'categories/screwdrivers.html';
  const browser = await chromium.launch({
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const aligned = async (id) => {
      await page.waitForFunction(
        (id) => {
          const header = document.querySelector('header');
          const expected =
            getComputedStyle(header).position === 'sticky'
              ? Math.ceil(header.getBoundingClientRect().height) + 16
              : 16;
          return Math.abs(document.getElementById(id).getBoundingClientRect().top - expected) < 3;
        },
        id,
        { timeout: 5000 },
      );
    };
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url('index.html'));
      assert.equal(await page.locator('.hero-product').getAttribute('href'), destination);
      await page.locator('.hero-product').click();
      assert(page.url().endsWith(destination));
      await page.goto(url('index.html'));
      if (width <= 760) await page.locator('.mobile-menu-toggle').click();
      await page.locator('.nav-custom-highlight').click();
      await aligned('custom-manufacturing');
      await page.goto(url('about.html'));
      if (width <= 760) await page.locator('.mobile-menu-toggle').click();
      await page.locator('.nav-custom-highlight').click();
      await aligned('custom-manufacturing');
      await page.goto(url('index.html'));
      if (width <= 760) await page.locator('.mobile-menu-toggle').click();
      await page.locator('header .nav-enquiry').click();
      assert.match(page.url(), /contact\.html#custom-enquiry/);
      await aligned('custom-enquiry');
    }
    console.log(
      'PASS: Watchmaker’s Bench opens Precision Screwdrivers; both header custom anchors align below the actual header on mobile, tablet and desktop.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
