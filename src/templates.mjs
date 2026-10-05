// Source templates generate all pages; edit here rather than generated HTML.
import { categories } from './catalogue.mjs';
import { officeLocation } from './location.mjs';
import { indexCatalogue } from './catalogue-index.mjs';
// The same family order is used in desktop groups and mobile filters.
const familyNames = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials'];
/** Escape catalogue text before inserting it into HTML attributes or content. */
export const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const email = 'roshanindustriestech@gmail.com',
  listing = 'https://share.google/FMr11h7ed3ixmurjm';
/** Prepare a catalogue enquiry; visitors review and send it in their email app. */
export const mail = (p) =>
  `mailto:${email}?subject=${encodeURIComponent(p ? `Product enquiry: ${p.sku} — ${p.name}` : 'Roshan Industries product enquiry')}&body=${encodeURIComponent(p ? `Hello Roshan Industries,\n\nProduct: ${p.name}\nSKU: ${p.sku}\nCatalogue reference: ${p.id.toUpperCase()}\n\nQuantity required: \nSpecifications: \nCompany: \nContact number: ` : 'Hello Roshan Industries,\n\nProduct / SKU: \nQuantity: \nSpecifications: \nCompany: \nContact number: ')}`;

/** Prepare a custom-manufacturing enquiry, optionally referencing an existing SKU. */
export const customMail = (p) =>
  `mailto:${email}?subject=${encodeURIComponent('Custom product manufacturing enquiry' + (p ? ' - ' + p.sku : ''))}&body=${encodeURIComponent('Hello Roshan Industries,\n\nI would like to discuss a custom product.\n' + (p ? 'Catalogue starting point: ' + p.name + ' / ' + p.sku + '\n' : '') + 'Intended use: \nDimensions and tolerances: \nPreferred material / finish: \nQuantity required: \nPreferred timeline: \nCompany: \nContact number: \n\nI will attach any drawings, photographs or reference samples available.')}`;
/** Reuse the manufacturing story and process across the homepage and About Us. */
const customSection = (base = '', id = 'custom-manufacturing') =>
  /* HTML */ `<section class="custom-section" id="${id}">
    <div class="container">
      <div class="custom-heading">
        <div>
          <p class="eyebrow">CUSTOM PRODUCT MANUFACTURING</p>
          <h2>Your requirement.<br />Our manufacturing experience.</h2>
        </div>
        <p class="lead">
          Have a product in mind that is outside our catalogue? Roshan Industries can manufacture
          custom products. Share your drawing, dimensions or reference and let’s discuss what you
          need.
        </p>
      </div>
      <div class="custom-grid">
        <article>
          <span class="step-number">01</span>
          <h3>Tell us what you need</h3>
          <p>
            Start with the product’s purpose, a drawing or photograph, key dimensions and your
            required quantity.
          </p>
        </article>
        <article>
          <span class="step-number">02</span>
          <h3>Discuss the details</h3>
          <p>
            Talk through materials, finish, fit and other requirements with our team. We will review
            feasibility for your project.
          </p>
        </article>
        <article>
          <span class="step-number">03</span>
          <h3>Agree the next steps</h3>
          <p>
            Confirm the specification, quotation and timeline directly with Roshan Industries before
            proceeding.
          </p>
        </article>
      </div>
      <div class="custom-actions">
        <a class="button button-light" href="${base}contact.html#custom-enquiry"
          >Discuss a custom product</a
        ><span>Drawings, reference photos or an existing part are a helpful starting point.</span>
      </div>
    </div>
  </section>`;

/** Render one product card with links relative to its current page depth. */
export function card(p, base = '') {
  return /* HTML */ `<article class="product-card">
    <a class="product-image" href="${base + p.url}"
      ><img src="${base + p.image}" alt="${esc(p.name)}" width="480" height="480" loading="lazy"
    /></a>
    <div class="product-card-copy">
      <a class="product-category" href="${base}categories/${p.categoryId}.html"
        >${esc(p.category)}</a
      >
      <h3><a href="${base + p.url}">${esc(p.name)}</a></h3>
      <div class="card-bottom">
        <span class="sku">${p.sku}</span
        ><a href="${base + p.url}" class="details-link">View product</a>
      </div>
    </div>
  </article>`;
}
/** Render category artwork and a count derived from the current catalogue. */
export function categoryCard(c, products, base = '') {
  return /* HTML */ `<a class="category-card" href="${base}categories/${c.id}.html"
    ><div class="category-image">
      <img
        src="${base}assets/products/${c.image}.webp"
        alt=""
        width="480"
        height="480"
        loading="lazy"
      />
    </div>
    <div>
      <span class="eyebrow">${esc(c.family)}</span>
      <h3>${esc(c.name)}</h3>
      <p>${indexCatalogue(products).byCategory.get(c.id)?.length || 0} products</p>
    </div></a
  >`;
}
/** Shared document shell, navigation, branding, styles and footer for every route. */
export function layout(title, body, { base = '', active = '', description = '', page = '' } = {}) {
  // Give each main page a relevant search description; products supply their own.
  const descriptions = {
    home: 'Roshan Industries manufactures watch parts and custom products in Mumbai, with over 100 years of heritage. Explore our tools and discuss your requirements.',
    categories: 'Browse Roshan Industries watchmaking, clockmaking, jewellery and workshop tool categories. Find products and enquire about custom manufacturing in Mumbai.',
    products: 'Explore 199 watchmaking, clockmaking, jewellery and workshop products from Roshan Industries in Mumbai. Search by name or SKU and enquire about custom products.',
    about: 'Discover Roshan Industries, a Mumbai watch parts manufacturer with over 100 years of heritage and three generations of experience. Learn about our custom manufacturing.',
    contact: 'Contact Roshan Industries in Goregaon West, Mumbai for watch parts, catalogue enquiries and custom manufacturing. Share your drawing, sample or product requirements.',
  };
  const pageDescription = description || descriptions[active] || descriptions.home;
  const logo = /* HTML */ `<img
      src="${base}assets/roshan-logo.png"
      width="102"
      height="65"
      alt="Roshan Industries"
    /><span>ROSHAN INDUSTRIES<small>WATCHMAKING · CLOCK · JEWELLERY</small></span>`;
  return /* HTML */ `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${esc(title)} | Roshan Industries</title>
        <meta
          name="description"
          content="${esc(pageDescription)}"
        />
        <meta property="og:title" content="${esc(title)} | Roshan Industries" />
        <meta property="og:description" content="${esc(pageDescription)}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Roshan Industries" />
        <meta name="theme-color" content="#111d30" />
        <link rel="icon" href="${base}assets/roshan-logo.png" />
        <link rel="stylesheet" href="${base}styles.css" />
        <link rel="stylesheet" href="${base}modern.css" />
        ${page === 'catalogue' ? `<script src="${base}products.js" defer></script>` : ''}
        <script src="${base}app.js" defer></script>
      </head>
      <body data-page="${page}">
        <a class="skip" href="#main">Skip to content</a>
        <div class="topbar">
          <div class="container">
            <span>Custom manufacturing. A century of experience.</span
            ><a class="header-email" href="mailto:${email}">${email}</a>
          </div>
        </div>
        <header>
          <div class="container header-main">
            <a class="brand" href="${base}index.html">${logo}</a>
            <button
              class="mobile-menu-toggle"
              type="button"
              aria-expanded="true"
              aria-controls="primary-navigation"
            >
              Menu
            </button>
            <form class="header-search" action="${base}catalogue.html" role="search">
              <label class="sr-only" for="search">Search the catalogue</label
              ><input
                id="search"
                name="q"
                type="search"
                placeholder="Search by product name or SKU"
                autocomplete="off"
              /><button aria-label="Search products" type="submit">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="10" cy="10" r="6.5" />
                  <path d="m15 15 6 6" />
                </svg>
              </button>
            </form>
            <a
              class="catalogue-download"
              href="${base}assets/roshan-product-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download catalogue<small>PDF · 20 pages</small></a
            >
          </div>
          <nav aria-label="Main navigation">
            <div class="container nav-links" id="primary-navigation">
              ${[
                ['index.html', 'Home', 'home'],
                ['catalogue.html', 'Products', 'products'],
                ['categories.html', 'Categories', 'categories'],
                ['index.html#custom-manufacturing', 'Custom Manufacturing', 'custom'],
                ['about.html', 'About Us', 'about'],
                ['contact.html', 'Contact Us', 'contact'],
              ]
                .map(
                  ([url, label, id]) =>
                    /* HTML */ `<a
                      href="${base + url}"
                      class="${[active === id ? 'active' : '', id === 'custom' ? 'nav-custom-highlight' : ''].filter(Boolean).join(' ')}"
                      ${active === id ? 'aria-current="page"' : ''}
                      >${label}</a
                    >`,
                )
                .join('')}<a class="nav-enquiry" href="${base}contact.html#custom-enquiry"
                >Discuss a custom product</a
              >
            </div>
          </nav>
        </header>
        <main id="main">${body}</main>
        <section class="enquiry-strip">
          <div class="container">
            <div>
              <p class="eyebrow">SPEAK WITH ROSHAN INDUSTRIES</p>
              <h2>A custom product starts with a conversation.</h2>
            </div>
            <a class="button button-light" href="${base}contact.html">Discuss your requirements</a>
          </div>
        </section>
        <footer>
          <div class="container footer-grid">
            <div>
              <a class="brand footer-brand" href="${base}index.html">${logo}</a>
              <p>
                Tools and components for watchmaking,<br />clock repair and jewellery bench work.
              </p>
              <a class="footer-email" href="mailto:${email}">${email}</a>
              <div class="footer-custom-highlight">
                <h3>Custom Manufacturing</h3>
                <p>
                  Have a drawing, sample or idea? Let’s discuss a product made around your
                  requirements.
                </p>
                <a class="button button-light" href="${base}contact.html#custom-enquiry"
                  >Discuss your custom product</a
                >
              </div>
            </div>
            <div>
              <h3>Explore</h3>
              <a href="${base}catalogue.html">All products</a
              ><a href="${base}categories.html">Product categories</a
              ><a href="${base}index.html#custom-manufacturing">Custom manufacturing</a
              ><a href="${base}about.html">About Us</a><a href="${base}contact.html">Contact Us</a>
              <a
                href="${base}assets/roshan-product-catalogue.pdf"
                download="Roshan-Industries-Catalogue.pdf"
                >Download catalogue</a
              >
            </div>
            <div class="footer-location">
              <h3>Office location</h3>
              <address>${esc(officeLocation.address)}</address>
              <iframe
                class="footer-map"
                title="${esc(officeLocation.mapLabel)}"
                src="${esc(officeLocation.embedUrl)}"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="container footer-bottom">
            <span class="footer-heritage">© 1900 Roshan Industries</span>
          </div>
        </footer>
      </body>
    </html>`;
}
/** Build the location trail for root and nested pages. */
const breadcrumb = (label, base = '', parent = '') =>
  /* HTML */ `<nav class="container breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li><a href="${base}index.html">Home</a></li>
      ${[...parent.matchAll(/<a[\s\S]*?<\/a>/g)].map((match) => `<li>${match[0]}</li>`).join('')}
      <li aria-current="page">${esc(label)}</li>
    </ol>
  </nav>`;
/** Homepage: custom manufacturing leads, followed by catalogue discovery. */
export function home(products) {
  const featured = [
    'p15-01',
    'p02-01',
    'p08-05',
    'p16-02',
    'p11-12',
    'p07-12',
    'p06-05',
    'p05-05',
  ].map((id) => indexCatalogue(products).byId.get(id));
  return layout(
    'Custom Manufacturing & Watchmaking Tools',
    /* HTML */ `<section class="hero">
        <div class="container hero-layout">
          <div class="hero-copy">
            <p class="eyebrow">MADE FOR YOUR REQUIREMENTS</p>
            <h1>Custom products.<br /><span>Made for your needs.</span></h1>
            <p>
              Custom product manufacturing in Mumbai, backed by over 100 years of heritage. Bring us
              your requirements, or explore our watchmaking, clock and jewellery tools.
            </p>
            <div class="hero-actions">
              <a class="button button-gold" href="contact.html#custom-enquiry"
                >Discuss a custom product</a
              ><a class="quiet-link" href="catalogue.html">Explore the catalogue</a>
            </div>
            <div class="heritage-line">
              <strong>100+</strong><span>years of manufacturing heritage<br />Mumbai, India</span>
            </div>
          </div>
          <div class="hero-visual">
            <a
              class="hero-product"
              href="categories/screwdrivers.html"
              aria-label="Explore Precision Screwdrivers"
            >
              <img
                src="assets/products/p15-01.webp"
                alt="Roshan Industries precision screwdriver stand"
                width="480"
                height="480"
              /><span>THE WATCHMAKER’S BENCH</span>
            </a>
            <div class="hero-small">
              <a href="categories/eye-loupes.html"
                ><img
                  src="assets/products/p02-01.webp"
                  alt="Roshan Industries wooden eye loupes"
                  width="480"
                  height="480"
                /><span>Eye loupes & magnifiers</span></a
              ><a href="categories/clock-keys.html"
                ><img
                  src="assets/products/p11-12.webp"
                  alt="Roshan Industries brass clock key"
                  width="480"
                  height="480"
                /><span>Clock winding keys</span></a
              >
            </div>
          </div>
        </div>
      </section>
      <div class="trust-row container">
        <div>
          <strong>Manufacturing heritage</strong><span>Over a century, rooted in Mumbai</span>
        </div>
        <div>
          <strong>${products.length} catalogue products</strong
          ><span>Organised for the way you work</span>
        </div>
        <div>
          <strong>Custom manufacturing</strong
          ><span>Your drawings, dimensions and requirements</span>
        </div>
      </div>
      ${customSection()}
      <section class="section container">
        <div class="section-head">
          <div>
            <p class="eyebrow">BROWSE WITH PURPOSE</p>
            <h2>Tools for your trade</h2>
          </div>
          <a class="text-link" href="categories.html">View all categories</a>
        </div>
        <div class="category-grid">
          ${categories
            .slice(0, 6)
            .map((c) => categoryCard(c, products))
            .join('')}
        </div>
      </section>
      <section class="section section-muted">
        <div class="container">
          <div class="section-head">
            <div>
              <p class="eyebrow">FROM THE ROSHAN INDUSTRIES CATALOGUE</p>
              <h2>Explore the range</h2>
            </div>
            <a class="text-link" href="catalogue.html">Browse all products</a>
          </div>
          <div class="product-grid">${featured.map((p) => card(p)).join('')}</div>
        </div>
      </section>
      <section class="section container legacy-layout">
        <div class="legacy-stat">
          <strong>100<span>+</span></strong>
          <p>YEARS OF HERITAGE</p>
          <span>Mumbai, India</span>
        </div>
        <div>
          <p class="eyebrow">QUALITY HAS A NAME</p>
          <h2>Roshan Industries</h2>
          <p class="lead">A long-standing connection to the craft of time.</p>
          <p>
            With over 100 years of manufacturing heritage in Mumbai, Roshan Industries brings
            together horological tools, watchmaker’s essentials, jewellery tools and allied
            products.
          </p>
          <a class="text-link" href="about.html">Discover our story</a>
        </div>
      </section>`,
    { active: 'home', page: 'home' },
  );
}
/** Group the fifteen category pages by trade. */
export function categoriesPage(products) {
  // Compute family totals once, then reuse them for overview links and section headers.
  const index = indexCatalogue(products);
  const families = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials'].map(
    (name) => ({
      name,
      id: name.toLowerCase().replaceAll(' ', '-'),
      categories: categories.filter((category) => category.family === name),
      count: index.byFamily.get(name)?.length || 0,
    }),
  );
  return layout(
    'Product Categories',
    /* HTML */ `${breadcrumb('Categories')}
      <section class="container page-intro">
        <p class="eyebrow">A PLACE FOR EVERY TOOL</p>
        <h1>Find your category.</h1>
        <p>
          Explore by task and trade, from watch inspection and bracelet work to clock winding and
          jewellery bench setups.
        </p>
      </section>
      <nav class="container family-overview" aria-label="Category families">
        ${families.map((family) => `<a href="#family-${family.id}"><span class="eyebrow">CATEGORY FAMILY</span><strong>${esc(family.name)}</strong><span>${family.categories.length} categories · ${family.count} products</span></a>`).join('')}
      </nav>
      ${families
        .map(
          (family) =>
            /* HTML */ `<section class="section container family-section" id="family-${family.id}">
              <div class="family-heading">
                <div>
                  <h2>${esc(family.name)}</h2>
                </div>
                <div class="family-count">
                  <span>${family.categories.length} categories &middot; ${family.count} products</span>
                </div>
              </div>
              <div class="category-grid">
                ${family.categories.map((c) => categoryCard(c, products)).join('')}
              </div>
            </section>`,
        )
        .join('')}`,
    { active: 'categories', page: 'categories' },
  );
}
/** Render all catalogue cards; the browser script progressively adds filtering. */
export function cataloguePage(products, category = null) {
  const base = category ? '../' : '',
    items = category ? indexCatalogue(products).byCategory.get(category.id) || [] : products,
    title = category ? category.name : 'All Products';
  return layout(
    title,
    /* HTML */ `${breadcrumb(title, base, category ? '<a href="../categories.html">Categories</a><span>/</span>' : '')}
      <section class="container page-intro">
        <p class="eyebrow">
          ${category ? esc(category.family) : 'THE COMPLETE ROSHAN INDUSTRIES RANGE'}
        </p>
        <h1>${esc(title)}</h1>
        <p>
          ${esc(category ? category.description : 'Browse tools and components by category. Search by name or SKU and contact us for specifications, availability and quotations.')}
        </p>
      </section>
      <section
        class="container catalogue-section"
        data-catalogue="${category ? category.id : 'all'}"
        data-base="${base}"
      >
        <aside class="sidebar">
          <h2>Product categories</h2>
          <a href="${base}catalogue.html" ${!category ? ' class="active"' : ''}
            >All products <span>${products.length}</span></a
          >${familyNames
            .map(
              (family) =>
                `<div class="sidebar-family"><h3>${esc(family)} <span>${categories.filter((c) => c.family === family).length}</span></h3>${categories
                  .filter((c) => c.family === family)
                  .map(
                    (c) =>
                      `<a href="${base}categories/${c.id}.html" ${category?.id === c.id ? 'class="active" aria-current="page"' : ''}>${esc(c.name)} <span>${indexCatalogue(products).byCategory.get(c.id)?.length || 0}</span></a>`,
                  )
                  .join('')}</div>`,
            )
            .join('')}
          <div class="sidebar-note">
            <h3>Need help choosing?</h3>
            <p>Share your requirements with our team.</p>
            <a class="text-link" href="${base}contact.html">Contact Roshan Industries</a>
          </div>
        </aside>
        <div class="catalogue-content">
          <div class="catalogue-toolbar">
            <p id="results-count">${items.length} products</p>
            <div>
              <label for="sort">Sort by</label
              ><select id="sort">
                <option value="catalogue">Catalogue order</option>
                <option value="asc">Name: A–Z</option>
                <option value="desc">Name: Z–A</option>
                <option value="sku">SKU</option>
              </select>
            </div>
          </div>
          <div class="catalogue-search">
            <label class="sr-only" for="catalogue-query">Search within ${esc(title)}</label
            ><input id="catalogue-query" type="search" placeholder="Search by name or SKU" /><button
              id="reset-search"
              type="button"
            >
              Clear
            </button>
          </div>
          <div class="mobile-category">
            <label for="category-jump">Browse category</label
            ><select id="category-jump">
              <option value="${base}catalogue.html">All products</option>
              ${familyNames
                .map(
                  (family) =>
                    `<optgroup label="${esc(family)}">${categories
                      .filter((c) => c.family === family)
                      .map(
                        (c) =>
                          `<option value="${base}categories/${c.id}.html" ${category?.id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`,
                      )
                      .join('')}</optgroup>`,
                )
                .join('')}
            </select>
          </div>
          <div class="product-grid catalogue-grid" id="catalogue-grid">
            ${items.map((p) => card(p, base)).join('')}
          </div>
          <div class="empty-state" id="empty-state" hidden>
            <h2>No matching products</h2>
            <p>Try a shorter product name or a SKU such as RIT-0001.</p>
          </div>
          <nav id="pagination" class="pagination" aria-label="Product catalogue pages"></nav>
        </div>
      </section>`,
    {
      base,
      active: 'products',
      page: 'catalogue',
      description: category?.description,
    },
  );
}
/** Product details, grounded description, enquiry links and related entries. */
export function productPage(p, products) {
  const related = (indexCatalogue(products).byCategory.get(p.categoryId) || [])
    .filter((q) => q.id !== p.id)
    .slice(0, 4);
  return layout(
    p.name,
    /* HTML */ `${breadcrumb(p.name, '../', /* HTML */ `<a href="../catalogue.html">Products</a><span>/</span><a href="../categories/${p.categoryId}.html">${esc(p.category)}</a><span>/</span>`)}
      <section class="container product-detail">
        <div class="detail-image">
          <img src="../${p.image}" alt="${esc(p.name)}" width="480" height="480" />
        </div>
        <div class="detail-copy">
          <a class="eyebrow" href="../categories/${p.categoryId}.html"
            >${esc(p.family)} / ${esc(p.category)}</a
          >
          <h1>${esc(p.name)}</h1>
          <span class="detail-sku">SKU ${p.sku}</span>
          <div class="product-description">
            <h2>About this product</h2>
            <p>${esc(p.description)}</p>
          </div>
          <p class="product-note">${esc(p.note)}</p>
          <dl class="spec-table">
            <div>
              <dt>SKU</dt>
              <dd>${p.sku}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd><a href="../categories/${p.categoryId}.html">${esc(p.category)}</a></dd>
            </div>
            <div>
              <dt>Catalogue reference</dt>
              <dd>${p.id.toUpperCase()} · Page ${p.page}</dd>
            </div>
            <div>
              <dt>Pricing & availability</dt>
              <dd>On enquiry</dd>
            </div>
          </dl>
          <a class="button button-navy" href="${esc(mail(p))}">Enquire about this product</a>
          <p class="enquiry-hint">Your email will include the product name and SKU.</p>
          <a
            class="text-link"
            href="../assets/roshan-product-catalogue.pdf#page=${p.page}"
            target="_blank"
            rel="noopener"
            >View in the product catalogue</a
          >
        </div>
      </section>
      <section class="container product-custom">
        <div>
          <p class="eyebrow">NEED SOMETHING DIFFERENT?</p>
          <h2>Let’s discuss a custom product.</h2>
          <p>
            Use this catalogue item as a starting point, or share a new design. Tell us your
            required dimensions, material, finish and quantity so we can review feasibility.
          </p>
        </div>
        <a class="button button-navy" href="${esc(customMail(p))}"
          >Enquire about a custom version</a
        >
      </section>
      ${
        related.length
          ? /* HTML */ `<section class="section section-muted">
              <div class="container">
                <div class="section-head">
                  <h2>In the same category</h2>
                  <a class="text-link" href="../categories/${p.categoryId}.html">View category</a>
                </div>
                <div class="product-grid">${related.map((q) => card(q, '../')).join('')}</div>
              </div>
            </section>`
          : ''
      }`,
    {
      base: '../',
      active: 'products',
      page: 'product',
      description: `${p.name}. ${p.description}`,
    },
  );
}
/** Company heritage, range and custom manufacturing approach. */
export function aboutPage(products) {
  return layout(
    'About Us',
    /* HTML */ `${breadcrumb('About Us')}
      <section class="container page-intro">
        <p class="eyebrow">QUALITY HAS A NAME</p>
        <h1>A heritage built around the details.</h1>
        <p>Roshan Industries. Watch parts manufacturing and tools for the craft of time.</p>
      </section>
      <section class="section container about-story">
        <div class="about-mark">
          <img src="assets/roshan-logo.png" alt="Roshan Industries" width="306" height="195" />
          <p>ROSHAN INDUSTRIES</p>
          <span>Mumbai, India</span>
        </div>
        <div>
          <h2>Rooted in Mumbai.<br />Connected to the craft.</h2>
          <p class="lead">Over 100 years of manufacturing heritage.</p>
          <p>
            Roshan Industries works in watch parts manufacturing in Mumbai. Our catalogue brings
            together horological and watchmaker’s tools, jewellery tools and allied products.
          </p>
          <p>
            Our range includes inspection loupes, precision screwdrivers, case opening and bracelet
            tools, clock keys, bench holders and accessories. Each has its own place in the work of
            making, maintaining and repairing.
          </p>
          <p>
            Alongside our catalogue, custom product manufacturing is a central part of what we
            offer. A requirement may begin with a drawing, a sample, a photograph or a conversation
            about how a part needs to work.
          </p>
          <p>
            We welcome enquiries from watchmakers, repair workshops, jewellery professionals and
            businesses. Whether you are selecting a catalogue tool or developing a custom product,
            our team is your direct point of contact for specifications and quotations.
          </p>
        </div>
      </section>
      <section class="section section-muted">
        <div class="container about-numbers">
          <div><strong>100+</strong><span>Years of manufacturing heritage</span></div>
          <div><strong>${products.length}</strong><span>Products in our catalogue</span></div>
          <div><strong>${categories.length}</strong><span>Curated product categories</span></div>
        </div>
      </section>
      <section class="section container about-depth">
        <div>
          <p class="eyebrow">WHAT WE DO</p>
          <h2>From the workbench to your next idea.</h2>
          <p>
            Our catalogue covers close inspection, watch-case servicing, bracelet and strap work,
            glass and hand fitting, clock winding, jewellery bench work and small-part organisation.
            It gives customers a practical starting point for discussing the tools and components
            they need.
          </p>
          <p>
            For custom enquiries, we focus the conversation on the product’s application and the
            details that determine its fit: dimensions, tolerances, materials, finish and quantity.
            Each project is discussed individually; specifications, feasibility and timelines are
            agreed with our team.
          </p>
        </div>
        <div>
          <p class="eyebrow">HOW WE WORK WITH YOU</p>
          <h2>Clear requirements. Direct conversations.</h2>
          <p>
            We believe a useful manufacturing enquiry starts with understanding the task. Share the
            problem you are solving as well as the part you want to make, and include any existing
            references.
          </p>
          <p>
            Our Mumbai heritage connects our business to the detailed work of watchmaking and
            related trades. We carry that experience into conversations about both familiar
            catalogue products and new requirements.
          </p>
          <a class="text-link" href="contact.html#custom-enquiry">Talk to us about your project</a>
        </div>
      </section>
      <section class="section container leadership-section" aria-labelledby="leaders-title">
        <div class="section-head">
          <div>
            <p class="eyebrow">OUR PEOPLE &amp; GENERATIONS</p>
            <h2 id="leaders-title">The family behind Roshan Industries.</h2>
          </div>
        </div>
        <p class="lead">Three generations. One family story.</p>
        <ol class="generation-timeline">
          <li>
            <span class="generation-number" aria-hidden="true">01</span>
            <div class="generation-copy">
              <p class="eyebrow">FIRST GENERATION</p>
              <h3>Ahmed Rashid Roshan</h3>
              <p class="generation-relation">Father</p>
            </div>
          </li>
          <li>
            <span class="generation-number" aria-hidden="true">02</span>
            <div class="generation-copy">
              <p class="eyebrow">SECOND GENERATION</p>
              <h3>Imran Roshan</h3>
              <p class="generation-relation">Son</p>
            </div>
          </li>
          <li>
            <span class="generation-number" aria-hidden="true">03</span>
            <div class="generation-copy">
              <p class="eyebrow">THIRD GENERATION</p>
              <div class="generation-names">
                <h3>Abdullah Roshan</h3>
                <h3>Mohammed Roshan</h3>
              </div>
              <p class="generation-relation">Grandsons</p>
            </div>
          </li>
        </ol>
      </section>
      ${customSection('', 'about-custom')}
      <section class="section container">
        <div class="section-head">
          <h2>For the work you do.</h2>
          <a class="text-link" href="categories.html">Explore categories</a>
        </div>
        <div class="category-grid">
          ${[categories[0], categories[5], categories[7]].map((c) => categoryCard(c, products)).join('')}
        </div>
      </section>`,
    { active: 'about', page: 'about' },
  );
}
/** Contact information, custom enquiry checklist and practical FAQs. */
export function contactPage() {
  return layout(
    'Contact Us',
    /* HTML */ `${breadcrumb('Contact Us')}
      <section class="container page-intro">
        <p class="eyebrow">LET’S DISCUSS THE DETAILS</p>
        <h1>Contact Roshan Industries.</h1>
        <p>
          For custom product manufacturing or a catalogue enquiry, speak directly with our team in
          Mumbai.
        </p>
      </section>
      <section class="container custom-enquiry" id="custom-enquiry">
        <div>
          <p class="eyebrow">CUSTOM MANUFACTURING ENQUIRIES</p>
          <h2>Tell us what you want to make.</h2>
          <p>
            Share a drawing, reference photograph or details of an existing part. Include its
            intended use, dimensions, preferred materials or finish, quantity and target timeline.
            Our team will discuss feasibility and the next steps with you.
          </p>
          <a class="button button-navy" href="${esc(customMail())}"
            >Prepare a custom product enquiry</a
          >
          <p class="enquiry-hint">
            Opens your email application. Attach your drawings or photos, then review and send.
          </p>
        </div>
        <div class="enquiry-checklist">
          <h3>A useful starting point</h3>
          <ul>
            <li>What the product needs to do</li>
            <li>Drawing or reference photographs</li>
            <li>Dimensions and critical tolerances</li>
            <li>Preferred material and finish</li>
            <li>Required quantity and timeline</li>
          </ul>
          <p>Don’t have every detail yet? Start with what you know.</p>
        </div>
      </section>
      <section class="section container contact-layout">
        <div class="contact-primary">
          <p class="eyebrow">EMAIL OUR TEAM</p>
          <h2>Your next project<br />starts here.</h2>
          <a class="contact-email" href="mailto:${email}">${email}</a>
          <p>
            Tell us which product you’re interested in and the quantity you need. Include the SKU
            where possible so we can identify the exact catalogue entry.
          </p>
          <a class="button button-navy" href="${esc(mail())}">Prepare an email enquiry</a>
          <p class="enquiry-hint">
            Opens your email application. Review and send the message there.
          </p>
        </div>
        <div class="contact-info">
          <div>
            <span class="eyebrow">LOCATION</span>
            <h3>Goregaon West, Mumbai</h3>
            <address>${esc(officeLocation.address)}</address>
            <a
              class="text-link"
              href="${esc(officeLocation.directionsUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              >Get directions to our office</a
            >
          </div>
          <div>
            <span class="eyebrow">INCLUDE IN YOUR ENQUIRY</span>
            <ul>
              <li>Product name and SKU</li>
              <li>Quantity and size or variant</li>
              <li>Drawings or specifications, if applicable</li>
              <li>Company and contact details</li>
              <li>Preferred timeline</li>
            </ul>
          </div>
          <div>
            <span class="eyebrow">PRODUCT CATALOGUE</span
            ><a
              class="text-link"
              href="assets/roshan-product-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download our 20-page catalogue</a
            >
          </div>
        </div>
      </section>
      <section class="container section custom-faq">
        <p class="eyebrow">BEFORE YOU GET IN TOUCH</p>
        <h2>Custom manufacturing questions</h2>
        <details>
          <summary>Can I enquire about a product outside the catalogue?</summary>
          <p>
            Yes. Roshan Industries offers custom product manufacturing. Share your concept, drawing
            or reference so our team can review the requirement.
          </p>
        </details>
        <details>
          <summary>Do I need a finished technical drawing?</summary>
          <p>
            A drawing is helpful, but you can begin with photographs, a sample reference or a
            description of the intended use. Include the dimensions you already know.
          </p>
        </details>
        <details>
          <summary>What are the minimum order quantity and lead time?</summary>
          <p>
            These depend on the product and requirements. Send the specification and required
            quantity; our team will confirm feasibility, pricing and timing for your enquiry.
          </p>
        </details>
        <details>
          <summary>Can a catalogue product be a starting point?</summary>
          <p>
            Yes. Include the SKU and explain the changes you need. Our team will review whether the
            proposed custom version can be made.
          </p>
        </details>
      </section>`,
    { active: 'contact', page: 'contact' },
  );
}
