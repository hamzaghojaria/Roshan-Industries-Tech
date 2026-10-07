// Shared HTML generators, navigation and product/company page content.
// Source templates generate all pages; edit here rather than generated HTML.
import { categories } from './catalogue.mjs';
import { officeLocation } from './location.mjs';
import { indexCatalogue } from './catalogue-index.mjs';
import fs from 'node:fs';
// Verified premium-PDF pages keep each product's catalogue link in sync.
const premiumAuditFile = new URL('../reports/premium-catalogue-audit.json', import.meta.url);
const premiumCataloguePages = fs.existsSync(premiumAuditFile)
  ? JSON.parse(fs.readFileSync(premiumAuditFile, 'utf8')).sku_pages
  : {};
const arrivalSelection = JSON.parse(fs.readFileSync(new URL('./data/new-arrivals.json', import.meta.url), 'utf8'));
const arrivalSkus = new Set(arrivalSelection.skus);
const newBadge = (p, detail = false) => arrivalSkus.has(p.sku) ? `<span class="arrival-badge${detail ? ' arrival-badge-detail' : ''}">New</span>` : '';
// The same family order is used in desktop groups and mobile filters.
const familyNames = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials', 'Pumps'];
// Keep catalogue labels and destinations identical in the header and footer at every width.
const catalogueNavigation = [
  ['catalogue.html', 'Products', 'products'],
  ['categories.html', 'Categories', 'categories'],
  ['new-arrivals.html', 'New Arrivals', 'arrivals'],
];
/** Escape catalogue text before inserting it into HTML attributes or content. */
export const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const email = 'roshanindustriestech@gmail.com';
const whatsapp = (p) =>
  `https://wa.me/919821216170?text=${encodeURIComponent(p ? `Hello Roshan Industries, I would like to enquire about ${p.name} (SKU ${p.sku}).` : 'Hello Roshan Industries, I would like to discuss my product requirements.')}`;
const whatsappIcon = `<svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 6.8c-.5 0-1.4.7-1.4 1.8 0 2.7 3.9 6.8 7.3 7.6 1.3.3 2.7-.5 2.9-1.5.1-.5 0-.6-.4-.8l-2-1c-.4-.2-.6-.1-.8.2l-.7.8c-.2.2-.4.2-.7.1-1.4-.6-2.6-1.6-3.4-2.9-.2-.3-.2-.5 0-.7l.6-.7c.2-.2.2-.4.1-.7L8.7 7c-.1-.2-.3-.2-.7-.2Z" fill="currentColor"/></svg>`;
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
          Need a product beyond our catalogue? Share your drawing, sample or dimensions with Roshan Industries.
        </p>
      </div>
      <div class="custom-grid">
        <article>
          <span class="step-number">01</span>
          <h3>Tell us what you need</h3>
          <p>
            Share its purpose, dimensions, quantity and a drawing or sample.
          </p>
        </article>
        <article>
          <span class="step-number">02</span>
          <h3>Discuss the details</h3>
          <p>
            Review materials, finish and feasibility directly with our team.
          </p>
        </article>
        <article>
          <span class="step-number">03</span>
          <h3>Agree the next steps</h3>
          <p>
            Agree the specification, quotation and timeline before manufacturing.
          </p>
        </article>
      </div>
      <div class="custom-actions">
        <a class="button button-light" href="${base}contact.html#custom-enquiry"
          >Discuss a custom product</a
        ><span>Have a drawing or sample? Let’s talk.</span>
      </div>
    </div>
  </section>`;

/** Render one product card with links relative to its current page depth. */
export function card(p, base = '') {
  return /* HTML */ `<article class="product-card">
    ${newBadge(p)}
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
        src="${base}${c.image.startsWith('assets/') ? c.image : `assets/products/${c.image}.webp`}"
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
export function layout(
  title,
  body,
  { base = '', active = '', description = '', page = '', product = null } = {},
) {
  // Give each main page a relevant search description; products supply their own.
  const descriptions = {
    home: 'Roshan Industries manufactures watch parts and custom products in Mumbai, with 125+ years of service since 1900. Explore our tools and discuss your requirements.',
    categories:
      'Browse Roshan Industries watchmaking, clockmaking, jewellery and workshop tool categories. Find products and enquire about custom manufacturing in Mumbai.',
    products:
      'Explore 200+ watchmaking, clockmaking, jewellery and workshop products from Roshan Industries in Mumbai. Search by name or SKU and enquire about custom products.',
    about:
      'Discover Roshan Industries, a Mumbai watch parts manufacturer with 125+ years of service since 1900 and four generations of experience. Learn about our custom manufacturing.',
    contact:
      'Contact Roshan Industries in Goregaon West, Mumbai for watch parts, catalogue enquiries and custom manufacturing. Share your drawing, sample or product requirements.',
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
        <meta name="description" content="${esc(pageDescription)}" />
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
            <span>Custom manufacturing. Since 1900. 125+ years of service.</span>
            <div class="header-contact">
              <a class="header-email" href="mailto:${email}">${email}</a
              ><a
                class="header-whatsapp"
                href="${esc(whatsapp())}"
                target="_blank"
                rel="noopener noreferrer"
                >${whatsappIcon}Chat on WhatsApp</a
              >
            </div>
          </div>
        </div>
        <header>
          <div class="container header-main">
            <a class="brand" href="${base || './'}">${logo}</a>
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
              href="${base}assets/roshan-updated-product-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download catalogue<small>PDF &middot; 200+ products</small></a
            >
          </div>
          <nav aria-label="Main navigation">
            <div class="container nav-links" id="primary-navigation">
              ${[
                ['./', 'Home', 'home'],
                ...catalogueNavigation,
                ['./#custom-manufacturing', 'Custom Manufacturing', 'custom'],
                ['about.html', 'About Us', 'about'],
                ['contact.html', 'Contact Us', 'contact'],
              ]
                .map(
                  ([url, label, id]) =>
                    /* HTML */ `<a
                      href="${base + url}"
                      class="${[active === id ? 'active' : '', id === 'custom' ? 'nav-custom-highlight' : '', id === 'arrivals' ? 'nav-arrivals-highlight' : ''].filter(Boolean).join(' ')}"
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
              <div class="contact-actions">
                <a
                  class="whatsapp-link"
                  href="${esc(whatsapp())}"
                  target="_blank"
                  rel="noopener noreferrer"
                  >${whatsappIcon}Chat on WhatsApp</a
                >
              </div>
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
              ${catalogueNavigation
                .map(([url, label]) => `<a href="${base + url}">${label}</a>`)
                .join('')}
              <a href="${base || './'}#custom-manufacturing">Custom manufacturing</a
              ><a href="${base}about.html">About Us</a><a href="${base}contact.html">Contact Us</a>
              <a
                href="${base}assets/roshan-updated-product-catalogue.pdf"
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
            <div class="footer-social" role="group" aria-label="Social media">
              <span>LinkedIn</span><span>Instagram</span><span>X</span>
            </div>
            <span class="footer-heritage">Roshan Industries · Since 1900</span>
          </div>
        </footer>
        <a
          class="floating-whatsapp"
          href="${esc(whatsapp(product))}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Roshan Industries on WhatsApp"
          >${whatsappIcon}<span>Chat on WhatsApp</span></a
        >
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
/** Native scrolling remains available when carousel enhancement is unavailable. */
function homeSlider(id, label, cards) {
  return `<div class="home-slider" data-slider role="region" aria-roledescription="carousel" aria-label="${esc(label)}">
    <div class="slider-track" id="slider-${id}" tabindex="0" aria-label="${esc(label)}; swipe or use arrow keys">${cards}</div>
    <div class="slider-controls" hidden>
      <button type="button" data-slider-prev aria-controls="slider-${id}" aria-label="Previous ${esc(label.toLowerCase())}">&#8592;</button>
      <span class="slider-position"></span>
      <button type="button" data-slider-next aria-controls="slider-${id}" aria-label="Next ${esc(label.toLowerCase())}">&#8594;</button>
    </div>
  </div>`;
}

/** Curated additions use stable SKUs and never infer release dates. */
function arrivalProducts(products) {
  return arrivalSelection.skus.map((sku) => {
    const product = products.find((p) => p.sku === sku);
    if (!product) throw new Error('Unknown arrival SKU: ' + sku);
    return product;
  });
}
function arrivalCard(p) {
  return card(p).replace('<article class="product-card">', '<article class="product-card arrival-card" data-arrival-category="' + esc(p.categoryId) + '">');
}
export function newArrivalsPage(products) {
  const arrivals = arrivalProducts(products);
  const groups = [...new Map(arrivals.map((p) => [p.categoryId, p.category])).entries()];
  return layout('New Arrivals',     breadcrumb('New Arrivals') +     '<section class="container arrivals-intro"><p class="eyebrow">DISCOVER WHAT’S NEW</p><h1>New to the Roshan Industries range.</h1><p>Explore the latest additions to our online range. Find a product and speak with our team about your requirements.</p></section>' +     '<section class="container arrivals-section" aria-label="New arrival products"><div class="arrivals-toolbar"><div class="arrival-filters" role="group" aria-label="Filter new arrivals by category" hidden><button type="button" data-arrival-filter="all" aria-pressed="true">All arrivals</button>' + groups.map(([id, name]) => '<button type="button" data-arrival-filter="' + esc(id) + '" aria-pressed="false">' + esc(name) + '</button>').join('') + '</div></div><div class="product-grid arrivals-grid">' + arrivals.map(arrivalCard).join('') + '</div><div class="arrivals-more"><p>Looking for something else?</p><a class="text-link" href="catalogue.html">Explore the complete catalogue &#8594;</a></div></section>',
    {active: 'arrivals', page: 'arrivals', description: 'Explore new additions to the Roshan Industries online product range. View product details and enquire about specifications and availability.'});
}

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
              Custom product manufacturing in Mumbai, backed by 125+ years of service since 1900.
              Bring us your requirements, or explore our watchmaking, clock and jewellery tools.
            </p>
            <div class="hero-actions">
              <a class="button button-gold" href="contact.html#custom-enquiry"
                >Discuss a custom product</a
              ><a class="quiet-link" href="catalogue.html">Explore the catalogue</a>
            </div>
            <div class="heritage-line">
              <strong>125+</strong
              ><span>years of service<br />Since 1900 &middot; Mumbai, India</span>
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
          <strong>Manufacturing heritage</strong
          ><span>Since 1900 &middot; 125+ years of service</span>
        </div>
        <div><strong>200+ products</strong><span>Organised for the way you work</span></div>
        <div>
          <strong>Custom manufacturing</strong
          ><span>Your drawings, dimensions and requirements</span>
        </div>
      </div>
      <section class="section container">
        <div class="section-head">
          <div>
            <p class="eyebrow">EXPLORE PUMPS</p>
            <h2>Discuss your pumping requirements.</h2>
          </div>
          <a class="text-link" href="catalogue.html?family=Pumps">Explore all pumps</a>
        </div>
        <p class="lead">
          Tell us your requirements. We’ll help you find a suitable pump.
        </p>
        ${homeSlider(
          'pumps',
          'Pump categories',
          categories
            .filter((c) => c.family === 'Pumps')
            .map((c) => categoryCard(c, products))
            .join(''),
        )}
      </section>
      ${customSection()}
      <section class="section container">
        <div class="section-head">
          <div>
            <p class="eyebrow">BROWSE WITH PURPOSE</p>
            <h2>Tools for your trade</h2>
          </div>
          <a class="text-link" href="categories.html">View all categories</a>
        </div>
        ${homeSlider(
          'trades',
          'Tool categories',
          categories
            .slice(0, 6)
            .map((c) => categoryCard(c, products))
            .join(''),
        )}
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
          ${homeSlider('range', 'Featured products', featured.map((p) => card(p)).join(''))}
        </div>
      </section>
      <section class="section container home-arrivals"><div class="section-head"><div><p class="eyebrow">NEW TO OUR RANGE</p><h2>Discover the latest additions.</h2></div><a class="text-link" href="new-arrivals.html">View all new arrivals &#8594;</a></div><div class="product-grid">        ${arrivalProducts(products).slice(0, 3).map(arrivalCard).join('')}      </div></section>
      <section class="section container legacy-layout">
        <div class="legacy-stat">
          <strong>125<span>+</span></strong>
          <p>YEARS OF HERITAGE</p>
          <span>Mumbai, India</span>
        </div>
        <div>
          <p class="eyebrow">QUALITY HAS A NAME</p>
          <h2>Roshan Industries</h2>
          <p class="lead">A long-standing connection to the craft of time.</p>
          <p>
            With 125+ years of service in Mumbai since 1900, Roshan Industries brings together
            horological tools, watchmaker’s essentials, jewellery tools and allied products.
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
  const families = ['Watchmaking', 'Clockmaking', 'Jewellery', 'Workshop Essentials', 'Pumps'].map(
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
                  <span
                    >${family.categories.length} categories &middot; ${family.count} products</span
                  >
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
            >All products <span>200+</span></a
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
            <p id="results-count">${items.length >= 200 ? '200+' : items.length} products</p>
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
          ${newBadge(p, true)}
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
              <dd>
                ${p.onlineRange ? 'Online enquiry range' : `${p.id.toUpperCase()} · Page ${p.page}`}
              </dd>
            </div>
            <div>
              <dt>Pricing & availability</dt>
              <dd>On enquiry</dd>
            </div>
          </dl>
          <div class="enquiry-actions">
            <a class="button button-navy" href="${esc(mail(p))}">Enquire about this product</a>
            <a
              class="button whatsapp-link"
              href="${esc(whatsapp(p))}"
              target="_blank"
              rel="noopener noreferrer"
              >${whatsappIcon}Chat on WhatsApp</a
            >
          </div>
          <div class="product-catalogue-actions">
            ${!p.onlineRange ? `<a class="text-link" href="../assets/${premiumCataloguePages[p.sku] ? 'roshan-updated-product-catalogue.pdf' : 'roshan-product-catalogue.pdf'}#page=${premiumCataloguePages[p.sku] || p.page}" target="_blank" rel="noopener">View product in catalogue &#8599;</a>` : `<a class="text-link" href="../catalogue.html?q=${encodeURIComponent(p.sku)}">View product in catalogue &#8594;</a>`}
            <a class="button button-light" href="../assets/roshan-updated-product-catalogue.pdf" download="Roshan-Industries-Catalogue.pdf">Download catalogue &#8595;</a>
          </div>
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
      product: p,
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
          <p class="lead">Since 1900. Over 125 years of service.</p>
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
          <div><strong>125+</strong><span>Years of service &middot; Since 1900</span></div>
          <div><strong>200+</strong><span>Products in our catalogue</span></div>
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
      <section class="section container leadership-section family-heritage" aria-labelledby="leaders-title">
        <div class="family-heading"><div><p class="eyebrow">A FAMILY LEGACY &middot; SINCE 1900</p><h2 id="leaders-title">The family behind<br /><em>Roshan Industries.</em></h2></div><p>Four generations.<br />One name. A shared legacy.</p></div>
        <div class="home-slider family-slider" data-slider role="region" aria-roledescription="carousel" aria-label="The family behind Roshan Industries">
          <div class="family-navigation" aria-label="Explore the family generations" hidden><button type="button" data-family-index="0" aria-controls="slider-generations" aria-pressed="true"><span>01</span><strong>first generation</strong></button><button type="button" data-family-index="1" aria-controls="slider-generations" aria-pressed="false"><span>02</span><strong>second generation</strong></button><button type="button" data-family-index="2" aria-controls="slider-generations" aria-pressed="false"><span>03</span><strong>third generation</strong></button><button type="button" data-family-index="3" aria-controls="slider-generations" aria-pressed="false"><span>04</span><strong>fourth generation</strong></button></div>
          <div class="slider-track" id="slider-generations" tabindex="0" aria-label="Family generations; swipe or use arrow keys"><article class="family-chapter" aria-label="first generation">
  <div class="family-emblem" aria-hidden="true"><span class="family-emblem-top">ROSHAN INDUSTRIES</span><span class="family-monogram">VM</span><span class="family-emblem-bottom">GENERATION 01</span></div>
  <div class="family-person"><p class="eyebrow">FIRST GENERATION <span>/ The beginning</span></p><h3>Vali Mohammed Roshan</h3><p class="family-relationship">Great-grandfather</p><div class="family-signature"><span></span>Part of our story. Part of our future.</div></div>
</article><article class="family-chapter" aria-label="second generation">
  <div class="family-emblem" aria-hidden="true"><span class="family-emblem-top">ROSHAN INDUSTRIES</span><span class="family-monogram">AR</span><span class="family-emblem-bottom">GENERATION 02</span></div>
  <div class="family-person"><p class="eyebrow">SECOND GENERATION <span>/ A legacy continued</span></p><h3>Ahmed Rashid Roshan</h3><p class="family-relationship">Father</p><div class="family-signature"><span></span>Part of our story. Part of our future.</div></div>
</article><article class="family-chapter" aria-label="third generation">
  <div class="family-emblem" aria-hidden="true"><span class="family-emblem-top">ROSHAN INDUSTRIES</span><span class="family-monogram">IR</span><span class="family-emblem-bottom">GENERATION 03</span></div>
  <div class="family-person"><p class="eyebrow">THIRD GENERATION <span>/ The next chapter</span></p><h3>Imran Roshan</h3><p class="family-relationship">Son</p><div class="family-signature"><span></span>Part of our story. Part of our future.</div></div>
</article><article class="family-chapter" aria-label="fourth generation">
  <div class="family-emblem" aria-hidden="true"><span class="family-emblem-top">ROSHAN INDUSTRIES</span><span class="family-monogram">AM</span><span class="family-emblem-bottom">GENERATION 04</span></div>
  <div class="family-person"><p class="eyebrow">FOURTH GENERATION <span>/ Looking ahead</span></p><h3>Abdullah Roshan &amp;<br />Mohammed Roshan</h3><p class="family-relationship">Grandsons</p><div class="family-signature"><span></span>Part of our story. Part of our future.</div></div>
</article></div>
          <div class="slider-controls" hidden><span class="family-explore">EXPLORE OUR GENERATIONS</span><button type="button" data-slider-prev aria-controls="slider-generations" aria-label="Previous generation">&#8592;</button><span class="slider-position"></span><button type="button" data-slider-next aria-controls="slider-generations" aria-label="Next generation">&#8594;</button></div>
        </div>
      </section>
      ${customSection('', 'about-custom')}
      <section class="section container">
        <div class="section-head">
          <h2>For the work you do.</h2>
          <a class="text-link" href="categories.html">Explore categories</a>
        </div>
${homeSlider('about-work', 'Tools for the work you do', [categories[0], categories[5], categories[7], categories[2], categories[10], categories[14]].map((c) => categoryCard(c, products)).join(''))}
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
          <div class="enquiry-actions">
            <a class="button button-navy" href="${esc(mail())}">Prepare an email enquiry</a>
            <a
              class="button whatsapp-link"
              href="${esc(whatsapp())}"
              target="_blank"
              rel="noopener noreferrer"
              >${whatsappIcon}Chat on WhatsApp</a
            >
          </div>
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
              href="assets/roshan-updated-product-catalogue.pdf"
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

