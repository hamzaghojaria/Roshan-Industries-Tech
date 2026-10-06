// Validate generated routes, assets, brand names, product totals and SKU stability.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { categories, loadCatalogue } from '../src/catalogue.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Evaluate the generated browser data in isolation without running a browser.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'products.js'), 'utf8'), sandbox);
const products = sandbox.window.ROSHAN_PRODUCTS;
assert.equal(products.length, 212);
assert(
  products.every((p) => !/[?\uFFFD\u00C3]/u.test(p.name)),
  'Corrupted character in product name',
);
assert.equal(new Set(products.map((p) => p.sku)).size, 212);
assert.equal(new Set(products.map((p) => p.id)).size, 212);
assert.equal(products.find((p) => p.id === 'p05-03').sku, 'RIT-0039');
assert.equal(products.find((p) => p.id === 'p05-04').sku, 'RIT-0200');
assert.equal(new Set(products.map((p) => p.categoryId)).size, 21);
// Every product photo has a live product page.
assert.equal(
  fs.readdirSync(path.join(root, 'products')).filter((p) => p.endsWith('.html')).length,
  212,
);
assert.equal(
  fs.readdirSync(path.join(root, 'categories')).filter((p) => p.endsWith('.html')).length,
  21,
);
const expectedImages = new Set(products.filter((p) => !p.onlineRange).map((p) => p.id + '.webp'));
for (const image of fs.readdirSync(path.join(root, 'assets/products'))) {
  assert(expectedImages.has(image), `Unreferenced product image: ${image}`);
}
// Re-loading the catalogue must not change existing SKU assignments.
const before = fs.readFileSync(path.join(root, 'src/data/sku-map.json'), 'utf8');
loadCatalogue(root);
assert.equal(
  fs.readFileSync(path.join(root, 'src/data/sku-map.json'), 'utf8'),
  before,
  'SKUs must remain stable on rebuild.',
);
const files = [
  'index.html',
  'catalogue.html',
  'categories.html',
  'about.html',
  'contact.html',
  'photo-credits.html',
  ...categories.map((c) => `categories/${c.id}.html`),
  ...products.map((p) => p.url),
];
const decode = (value) => value.replaceAll('&amp;', '&');
// Check every local page, link, asset and repeated brand mark.
for (const file of files) {
  const filename = path.join(root, file),
    html = fs.readFileSync(filename, 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/);
  // Non-listing routes do not need the full browser catalogue payload.
  const needsCatalogue = file === 'catalogue.html' || file.startsWith('categories/');
  assert.equal(
    html.includes('products.js'),
    needsCatalogue,
    `Unexpected catalogue script: ${file}`,
  );
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
    const value = decode(m[1]);
    if (value.startsWith('tel:')) {
      assert.equal(value, 'tel:+919821216170', `Unexpected phone link: ${file}`);
      continue;
    }
    if (/^(?:https?:|mailto:|data:)/.test(value)) continue;
    if (value.startsWith('#')) {
      assert(ids.has(value.slice(1)), `Missing anchor ${file}: ${value}`);
      continue;
    }
    const local = path.resolve(path.dirname(filename), value.split(/[?#]/)[0]);
    assert(fs.existsSync(local), `Broken local link ${file}: ${value}`);
    assert(local === root || local.startsWith(root + path.sep), `Link outside the site: ${value}`);
  }
  const logos = [...html.matchAll(/<img\s+src="([^"]+roshan-logo\.png)"/g)];
  assert(logos.length >= 2, `Missing shared header/footer logo: ${file}`);
  assert.equal(logos[0][1], logos[logos.length - 1][1]);
}
// Product content and enquiry links must survive every rebuild.
for (const p of products) {
  assert(p.description && p.description.length > 120, `Missing useful description: ${p.sku}`);
  assert.match(p.sku, /^RIT-\d{4}$/);
  assert(!/[\u00e2\u00c3]/.test(p.name), `Corrupt product text: ${p.id}`);
  const html = fs.readFileSync(path.join(root, p.url), 'utf8');
  if (p.onlineRange) {
    assert(!html.includes('Page undefined'), `Invalid PDF reference: ${p.sku}`);
    assert(!html.includes('View in the product catalogue'), `Unverified PDF link: ${p.sku}`);
    assert(
      fs.readFileSync(path.join(root, 'photo-credits.html'), 'utf8').includes(p.imageSource),
      `Missing image attribution: ${p.sku}`,
    );
    assert(
      !html.includes('Reference image:'),
      `Unexpected product photo credit paragraph: ${p.sku}`,
    );
    assert(html.includes('Enquiry range.'), `Missing enquiry status: ${p.sku}`);
  }
  assert(html.includes('About this product'), `Missing description section: ${p.sku}`);
  assert(html.includes('Enquire about a custom version'), `Missing custom enquiry: ${p.sku}`);
  assert(html.includes('SKU ' + p.sku), `Missing SKU on ${p.url}`);
  assert(
    html.includes(`categories/${p.categoryId}.html`),
    `Missing product category link: ${p.url}`,
  );
}
assert.equal(
  new Set(products.map((p) => p.description)).size,
  212,
  'Descriptions must identify each product.',
);
assert(
  fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('id="custom-manufacturing"'),
);
assert(fs.readFileSync(path.join(root, 'contact.html'), 'utf8').includes('id="custom-enquiry"'));
for (const file of ['app.js', 'products.js'])
  new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'));
// Brand spelling is checked in visible copy and image descriptions, not filenames.
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  // A person's surname is not a shortened company reference.
  const visible = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(
      /\b(?:Vali Mohammed|Ahmed Rashid|Ahmed|Imran|Abdullah|Mohammed) Roshan\b/g,
      'Family member',
    );
  assert(!/\bRoshan\b(?! Industries)/i.test(visible), `Shortened company name: ${file}`);
}
console.log(
  `PASS: ${files.length} pages, all local links/assets, 212 unique stable SKUs, 21 categories, clean product text and shared header/footer logos.`,
);
