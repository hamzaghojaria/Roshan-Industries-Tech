// Browser regression checks: hover feedback, keyboard focus and reduced motion.
// Use an installed test dependency, with the retained portable tooling as a fallback.
const { chromium } = require('./helpers/browser.cjs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
let browser;
(async () => {
  const root = path.resolve(__dirname, '..');
  require('node:fs').mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
  const url = (file) => pathToFileURL(path.join(root, file)).href;
  browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url('catalogue.html'));
  const card = page.locator('.product-card').first();
  await card.hover();
  await page.waitForTimeout(400);
  const lifted = await card.evaluate((el) => getComputedStyle(el).transform);
  assert.match(lifted, /matrix\(1, 0, 0, 1, 0, -6\)/);
  const imageTransform = await card.locator('img').evaluate((el) => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return { scale: matrix.a, lift: matrix.f };
  });
  assert.equal(imageTransform.scale, 1, 'Product photo should keep its original size.');
  // Browser animation matrices can retain a tiny rounding difference at the end.
  assert(Math.abs(imageTransform.lift + 3) < 0.01, 'Product photo should lift slightly on hover.');
  await page.goto(url('categories.html'));
  const category = page.locator('.category-card').first();
  await category.hover();
  await page.waitForTimeout(450);
  assert.match(
    await category.evaluate((el) => getComputedStyle(el).transform),
    /matrix\(1, 0, 0, 1, 0, -7\)/,
  );
  await page.goto(url('contact.html'));
  // Both enquiry channels should retain the same hover feedback.
  for (const button of await page.locator('.contact-primary .button').all()) {
    await button.hover();
    await page.waitForTimeout(350);
    assert.match(
      await button.evaluate((el) => getComputedStyle(el).transform),
      /matrix\(1, 0, 0, 1, 0, -2\)/,
    );
  }
  await page.locator('#search').focus();
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator('.header-search').evaluate((el) => getComputedStyle(el).borderTopColor),
    'rgb(154, 177, 241)',
  );
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForFunction(() =>
    document.querySelector('header').classList.contains('is-scrolled'),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url('catalogue.html'));
  await page.locator('.product-card').first().hover();
  assert.equal(
    await page
      .locator('.product-card')
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
    'none',
  );
  assert.equal(
    await page
      .locator('.product-card')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    '0s',
  );
  assert.equal(await page.locator('.scroll-revealed').count(), 0);
  assert.equal(await page.locator('#catalogue-grid .product-card').count(), 12);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const noJS = await context.newPage();
  await noJS.goto(url('categories/clock-keys.html'));
  assert((await noJS.locator('.product-card').count()) > 0);
  assert.equal(await noJS.locator('.product-card').first().isVisible(), true);
  await context.close();
  console.log(
    'PASS: card lift, image lift, category hover, button feedback, search focus, sticky header, reduced motion and no-JavaScript visibility.',
  );
  await browser.close();
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  process.exitCode = 1;
});
