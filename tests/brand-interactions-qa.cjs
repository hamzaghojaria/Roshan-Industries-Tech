const { chromium } = require('./helpers/browser.cjs');
const { pathToFileURL } = require('url');
const path = require('path'),
  fs = require('fs'),
  assert = require('assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route('https://**/*', (r) => r.abort());
    fs.mkdirSync('reports/interaction-review', { recursive: true });
    let checked = 0;
    const routes = [
      'index.html',
      'about.html',
      'contact.html',
      'catalogue.html',
      'categories.html',
      'new-arrivals.html',
      'categories/clock-keys.html',
      'products/' + fs.readdirSync('products')[0],
    ];
    for (const file of routes) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(pathToFileURL(path.join(process.cwd(), file)).href, { waitUntil: 'load' });
      await page.evaluate(() => document.documentElement.classList.remove('page-loading'));
      const targets = page.locator(
        '.header-email, .nav-enquiry, main .button, footer .button, .nav-custom-highlight, .nav-arrivals-highlight',
      );
      for (const el of await targets.all()) {
        if (!(await el.isVisible())) continue;
        await el.hover();
        await page.waitForTimeout(260);
        const result = await el.evaluate((e) => {
          const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
          const lum = (c) => {
            const v = c.slice(0, 3).map((x) => {
              x /= 255;
              return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
            });
            return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
          };
          const fg = rgb(getComputedStyle(e).color);
          let p = e,
            bg;
          while (p) {
            const c = rgb(getComputedStyle(p).backgroundColor);
            if (c.length === 3 || c[3] === 1) {
              bg = c;
              break;
            }
            p = p.parentElement;
          }
          if (!bg) bg = [255, 255, 255];
          const a = lum(fg),
            b = lum(bg);
          return {
            text: e.textContent.trim(),
            ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          };
        });
        assert(result.ratio >= 4.5, file + ' ' + result.text + ' hover contrast ' + result.ratio);
        checked++;
      }
      if (file === 'index.html') {
        await page.locator('.header-email').hover();
        await page.waitForTimeout(260);
        await page
          .locator('.topbar')
          .screenshot({ path: 'reports/interaction-review/email-hover.png' });
        await page
          .locator('.custom-section')
          .screenshot({ path: 'reports/interaction-review/manufacturing-desktop.png' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page
          .locator('.custom-section')
          .screenshot({ path: 'reports/interaction-review/manufacturing-mobile.png' });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      }
    }
    console.log(
      'PASS ' +
        checked +
        ' hovered links/buttons across ' +
        routes.length +
        ' page types: minimum 4.5:1 text contrast and mobile manufacturing layout',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
