// Regression check: catalogue actions. Run after rebuilding the website.
const { chromium } = require('./helpers/browser.cjs');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://**/*', (r) => r.abort());
    const url = (file) => pathToFileURL(path.resolve(file)).href;
    for (const width of [320, 390, 600, 760, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url('about.html'));
      const track = page.locator('#slider-about-work');
      assert.equal(await track.locator(':scope > *').count(), 6);
      const sizes = await track.evaluate((el) => ({
        track: el.clientWidth,
        card: el.firstElementChild.getBoundingClientRect().width,
        gap: parseFloat(getComputedStyle(el).gap),
      }));
      const visible = width > 1024 ? 3 : width > 600 ? 2 : 1;
      if (visible > 1)
        assert(
          Math.abs(sizes.card * visible + sizes.gap * (visible - 1) - sizes.track) < 3,
          'Wrong visible cards at ' + width,
        );
      else assert(sizes.card < sizes.track && sizes.card > sizes.track * 0.8);
      await track.scrollIntoViewIfNeeded();
      await page.locator('[aria-controls="slider-about-work"][data-slider-next]').click();
      assert(await track.evaluate((el) => el.scrollLeft > 0));
      for (const file of [
        'products/rit-0001.html',
        'products/rit-0201.html',
        'products/rit-0219.html',
      ]) {
        await page.goto(url(file));
        const actions = page.locator('.product-catalogue-actions .button');
        assert.equal(await actions.count(), 2);
        const a = await actions.nth(0).boundingBox(),
          b = await actions.nth(1).boundingBox();
        const enquiry = page.locator('.enquiry-actions .button');
        const primary = await enquiry.nth(0).boundingBox(),
          whatsapp = await enquiry.nth(1).boundingBox();
        assert(Math.abs(primary.x - a.x) < 1, 'First column misaligned at ' + width);
        assert(Math.abs(whatsapp.x - b.x) < 1, 'Second column misaligned at ' + width);
        assert(
          Math.abs(primary.width - a.width) < 1,
          'Enquiry and catalogue widths differ at ' + width,
        );
        assert(
          Math.abs(whatsapp.width - b.width) < 1,
          'WhatsApp and download widths differ at ' + width,
        );
        assert(Math.abs(a.width - b.width) < 1, 'Unequal button widths at ' + width);
        if (width > 760) {
          assert(Math.abs(a.y - b.y) < 1);
          assert(Math.abs(a.height - b.height) < 1);
        } else {
          assert(Math.abs(a.x - b.x) < 1);
          assert(b.y >= a.y + a.height);
        }
        assert(a.height >= 44 && b.height >= 44);
        assert.equal(await page.locator('.arrival-badge').count(), 0);
        assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)));
      }
      console.log('PASS About slider and aligned catalogue actions at ' + width + 'px');
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
