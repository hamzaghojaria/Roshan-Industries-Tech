// Regression checks for mobile menu, breadcrumbs, straight hero and footer/map layout.
const path = require('node:path');
const { chromium } = require('./helpers/browser.cjs');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.route('https://**/*', (route) => route.abort());
    const url = (file) => pathToFileURL(path.join(root, file)).href;
    // Audit every generated route; map network availability does not affect local geometry.
    const audit = await browser.newPage({ reducedMotion: 'reduce' });
    await audit.route('https://**/*', (route) => route.abort());
    const routes = [
      'index.html',
      'catalogue.html',
      'new-arrivals.html',
      'categories.html',
      'about.html',
      'contact.html',
      ...fs.readdirSync(path.join(root, 'categories')).map((file) => `categories/${file}`),
      ...fs.readdirSync(path.join(root, 'products')).map((file) => `products/${file}`),
    ];
    for (const width of process.argv.includes('--interactions-only') ? [] : [320, 390, 760]) {
      console.log(`[mobile] Auditing ${routes.length} routes at ${width}px...`);
      await audit.setViewportSize({ width, height: 844 });
      for (const file of routes) {
        // Geometry needs loaded CSS and enhancement, not a completed large image download.
        await audit.goto(url(file), { waitUntil: 'domcontentloaded' });
        const geometry = await audit.evaluate(() => {
          const breadcrumb = document.querySelector('.breadcrumb');
          const content = document.querySelector('.page-intro, .product-detail');
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            offset:
              breadcrumb && content
                ? Math.abs(
                    breadcrumb.getBoundingClientRect().left - content.getBoundingClientRect().left,
                  )
                : 0,
            current: breadcrumb?.querySelectorAll('[aria-current="page"]').length || 0,
          };
        });
        assert(!geometry.overflow, `${file}: overflow at ${width}px`);
        assert(geometry.offset < 1, `${file}: breadcrumb alignment at ${width}px`);
        if (file !== 'index.html') assert.equal(geometry.current, 1, file);
      }
      await audit.goto(url('contact.html'));
      const trail = await audit
        .locator('.breadcrumb li')
        .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().top));
      assert.equal(trail[0], trail[1], 'Short breadcrumbs should stay on one line');
    }
    await audit.close();
    if (!process.argv.includes('--interactions-only'))
      console.log(
        `PASS: ${routes.length} routes at 320/390/760px, no overflow, aligned breadcrumbs and inline short trails.`,
      );
    for (const width of [320, 390, 760]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(url('index.html'));
      const toggle = page.locator('.mobile-menu-toggle');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert(!(await page.locator('#primary-navigation').isVisible()));
      await toggle.click();
      assert(await page.locator('#primary-navigation').isVisible());
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      await toggle.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(
        await page.locator('.hero-visual').evaluate((e) => getComputedStyle(e).transform),
        'none',
      );
      const footer = page.locator('.footer-grid');
      assert.equal(
        (await footer.evaluate((e) => getComputedStyle(e).gridTemplateColumns)).split(' ').length,
        1,
      );
      assert.equal(
        await page.locator('.footer-map').getAttribute('title'),
        'Roshan Industries office, Goregaon West, Mumbai',
      );
      assert.match(
        decodeURIComponent(await page.locator('.footer-map').getAttribute('src')),
        /cid=2993568223158557359&ll=19\.1519002,72\.8470708/,
      );
      assert.equal(await page.locator('.footer-map').getAttribute('loading'), 'lazy');
    }
    await page.goto(url('products/rit-0001.html'));
    assert.equal(await page.locator('[aria-label="Breadcrumb"] li').count(), 4);
    assert.match(
      await page.locator('[aria-label="Breadcrumb"] [aria-current="page"]').textContent(),
      /Plastic Eye Glass with Golden Ring/,
    );
    await page.locator('.breadcrumb a').nth(1).click();
    assert.match(page.url(), /catalogue\.html/);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url('index.html'));
    assert(await page.locator('#primary-navigation').isVisible());
    assert(!(await page.locator('.mobile-menu-toggle').isVisible()));
    assert.equal(
      await page.locator('.hero-visual').evaluate((e) => getComputedStyle(e).transform),
      'none',
    );
    assert.equal(
      (
        await page.locator('.footer-grid').evaluate((e) => getComputedStyle(e).gridTemplateColumns)
      ).split(' ').length,
      3,
    );
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const plain = await noJs.newPage();
    await plain.route('https://**/*', (route) => route.abort());
    await plain.goto(url('index.html'));
    assert(await plain.locator('#primary-navigation').isVisible());
    await noJs.close();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url('index.html'));
    fs.mkdirSync(path.join(root, 'artifacts/qa'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'artifacts/qa/mobile-header.png') });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'artifacts/qa/mobile-footer.png') });
    await page.goto(url('about.html'));
    assert.equal(await page.locator('#slider-generations > .family-chapter').count(), 4);
    assert.equal(await page.locator('.family-person h3').count(), 4);
    assert.match(
      await page.locator('.family-person').last().textContent(),
      /Abdullah Roshan.*Mohammed Roshan/s,
    );
    assert.equal(await page.locator('.leader-card').count(), 0);
    await page
      .locator('.leadership-section')
      .screenshot({ path: path.join(root, 'artifacts/qa/family-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .locator('.leadership-section')
      .screenshot({ path: path.join(root, 'artifacts/qa/family-desktop.png') });
    console.log(
      'PASS: mobile menu open/close/Escape, breadcrumbs, unrotated hero, footer columns, map attributes and no-JavaScript navigation.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
