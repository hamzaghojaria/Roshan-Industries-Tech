// Browser regression checks: custom enquiries, descriptive content and responsive layouts.
// Use an installed test dependency, with the retained portable tooling as a fallback.
const { createRequire } = require('node:module');
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  ({ chromium } = createRequire(
    require('node:path').resolve(__dirname, '../../.site-tools/qa/package.json'),
  )('playwright-core'));
}
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  require('node:fs').mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const file of [
      'index.html',
      'about.html',
      'contact.html',
      'products/rit-0001.html',
      'products/rit-0199.html',
    ]) {
      await page.goto(pathToFileURL(path.join(root, file)).href);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(
          !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `${file} overflow at ${width}`,
        );
      }
      await page.addStyleTag({ content: 'html{font-size:200%}' });
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
          console.log(
            await page.evaluate(() =>
              [...document.querySelectorAll('body *')]
                .filter(
                  (e) =>
                    e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.nav-links'),
                )
                .map((e) => ({
                  cls: e.className,
                  right: e.getBoundingClientRect().right,
                  text: e.textContent.slice(0, 70),
                }))
                .slice(0, 12),
            ),
          );
        assert(
          !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)),
          `${file} enlarged text overflow at ${width}`,
        );
      }
    }
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.match(await page.locator('h1').innerText(), /Custom products/);
    await page.locator('.hero-actions .button').click();
    assert.match(page.url(), /contact\.html#custom-enquiry/);
    const enquiry = decodeURIComponent(
      await page.locator('#custom-enquiry .button').getAttribute('href'),
    );
    assert.match(enquiry, /Custom product manufacturing enquiry/);
    assert.match(enquiry, /Dimensions and tolerances/);
    await page.locator('.custom-faq summary').first().click();
    assert((await page.locator('.custom-faq details').first().getAttribute('open')) !== null);
    await page.goto(pathToFileURL(path.join(root, 'products/rit-0001.html')).href);
    const custom = decodeURIComponent(
      await page.locator('.product-custom .button').getAttribute('href'),
    );
    assert.match(custom, /RIT-0001/);
    assert.match(custom, /Catalogue starting point/);
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.screenshot({
      path: path.join(root, 'artifacts/qa/custom-home.png'),
      fullPage: true,
    });
    await page.goto(pathToFileURL(path.join(root, 'about.html')).href);
    await page.screenshot({
      path: path.join(root, 'artifacts/qa/custom-about.png'),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      'PASS: custom enquiry navigation, email contents, SKU context, FAQ interactions, responsive layouts and 200% text on all changed page types.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
