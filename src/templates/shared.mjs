// Shared HTML generators, navigation and product/company page content.
// Source templates generate all pages; edit here rather than generated HTML.
import { categories, catalogueRecords } from '../catalogue.mjs';
import { officeLocation } from '../location.mjs';
import { indexCatalogue } from '../catalogue-index.mjs';
import fs from 'node:fs';
const productCount = catalogueRecords.length;
const downloadProductCount = productCount;
const arrivalSelection = JSON.parse(
  fs.readFileSync(new URL('../data/new-arrivals.json', import.meta.url), 'utf8'),
);
const arrivalSkus = new Set(arrivalSelection.skus);
const newBadge = (p, detail = false) =>
  arrivalSkus.has(p.sku)
    ? `<span class="arrival-badge${detail ? ' arrival-badge-detail' : ''}">New</span>`
    : '';
// The same family order is used in desktop groups and mobile filters.
const familyNames = [
  'Watchmaking',
  'Clockmaking',
  'Jewellery',
  'Workshop Essentials',
  'Precision Machining',
];
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
  `mailto:${email}?subject=${encodeURIComponent(p ? `Product enquiry: ${p.sku} — ${p.name}` : 'Roshan Industries product enquiry')}&body=${encodeURIComponent(p ? `Hello Roshan Industries,\n\nProduct: ${p.name}\nSKU: ${p.sku}\nCatalogue reference: ${p.sourcePanel}\n\nQuantity required: \nSpecifications: \nCompany: \nContact number: ` : 'Hello Roshan Industries,\n\nProduct / SKU: \nQuantity: \nSpecifications: \nCompany: \nContact number: ')}`;

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
          Need a product beyond our catalogue? Share your drawing, sample or dimensions with Roshan
          Industries.
        </p>
      </div>
      <div class="custom-grid">
        <article>
          <span class="step-number">01</span>
          <h3>Tell us what you need</h3>
          <p>Share its purpose, dimensions, quantity and a drawing or sample.</p>
        </article>
        <article>
          <span class="step-number">02</span>
          <h3>Discuss the details</h3>
          <p>Review materials, finish and feasibility directly with our team.</p>
        </article>
        <article>
          <span class="step-number">03</span>
          <h3>Agree the next steps</h3>
          <p>Agree the specification, quotation and timeline before manufacturing.</p>
        </article>
      </div>
      <div class="custom-actions">
        <a class="button button-light" href="${base}contact.html#custom-enquiry"
          >Discuss a custom product</a
        ><span>Have a drawing or sample? Let’s talk.</span>
      </div>
    </div>
  </section>`;

/** Frame excess source whitespace without changing or stretching the product pixels. */
export function productPhoto(p, base = '', lazy = false) {
  const image = `<img src="${base + p.image}" alt="${esc(p.name)}" width="${p.imageWidth}" height="${p.imageHeight}"${lazy ? ' loading="lazy"' : ''} />`;
  if (!p.imageFrame) return image;
  const { x, y, size } = p.imageFrame;
  const percent = (n) => ((n / size) * 100).toFixed(4) + '%';
  return `<span class="product-photo-framed" style="--photo-width:${percent(p.imageWidth)};--photo-height:${percent(p.imageHeight)};--photo-left:${percent(-x)};--photo-top:${percent(-y)}">${image}</span>`;
}

/** Render one product card with links relative to its current page depth. */
export function card(p, base = '') {
  return /* HTML */ `<article class="product-card">
    ${newBadge(p)}
    <a class="product-image" href="${base + p.url}">${productPhoto(p, base, true)}</a>
    <div class="product-card-copy">
      <span class="product-category">${esc(p.category)}</span>
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
    products: `Explore ${productCount} watchmaking, clockmaking, jewellery, workshop and precision machining products from Roshan Industries in Mumbai. Search by name or SKU and enquire about custom products.`,
    about:
      'Discover Roshan Industries, a Mumbai watch parts manufacturer with 125+ years of service since 1900 and four generations of experience. Learn about our custom manufacturing.',
    contact:
      'Contact Roshan Industries in Goregaon West, Mumbai for watch parts, catalogue enquiries and custom manufacturing. Share your drawing, sample or product requirements.',
  };
  const pageDescription = description || descriptions[active] || descriptions.home;
  const logo = /* HTML */ `<img
      src="${base}assets/roshan-logo-new.png"
      width="102"
      height="65"
      alt="Roshan Industries"
    /><span>ROSHAN INDUSTRIES<small>Custom CNC &amp; VMC - All Jobs</small></span>`;
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
        <link rel="icon" href="${base}assets/roshan-logo-new.png" />
        <link rel="stylesheet" href="${base}site.css" />
        <script src="${base}browser-products.js" defer></script>
        <script src="${base}app.js" defer></script>
        <script>
          document.documentElement.classList.add('page-loading');
          setTimeout(function () {
            document.documentElement.classList.remove('page-loading');
          }, 4000);
        </script>
      </head>
      <body data-page="${page}">
        <div class="page-loader" aria-hidden="true">
          <img src="${base}assets/roshan-logo-new.png" alt="" width="80" height="80" /><span
            class="page-loader-ring"
          ></span
          ><span>Loading</span>
        </div>
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
              <div
                id="search-suggestions"
                class="search-suggestions"
                role="listbox"
                aria-label="Search suggestions"
                hidden
              ></div>
              <span
                id="search-announcement"
                class="sr-only"
                role="status"
                aria-live="polite"
              ></span>
            </form>
            <a
              class="catalogue-download"
              href="${base}assets/roshan-industries-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download Catalogue<small>PDF &middot; ${downloadProductCount} products</small></a
            >
          </div>
          <nav aria-label="Main navigation">
            <div class="container nav-links" id="primary-navigation">
              ${[
                ['./', 'Home', 'home'],
                ...catalogueNavigation,
                ['./#custom-manufacturing', 'Custom Manufacturing', 'custom'],
                ['about.html', 'About Us', 'about'],
                ['founder.html', 'Our Founders & Offices', 'founder'],
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
              ><a href="${base}about.html">About Us</a
              ><a href="${base}founder.html">Our Founders &amp; Offices</a
              ><a href="${base}contact.html">Contact Us</a>
              <a
                href="${base}assets/roshan-industries-catalogue.pdf"
                download="Roshan-Industries-Catalogue.pdf"
                >Download Catalogue</a
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
              <span>LinkedIn</span
              ><a
                href="https://www.instagram.com/roshanindustriestech?stkn=MXQxbTN2cDkzZm9reg=="
                target="_blank"
                rel="noopener noreferrer"
                >Instagram</a
              >
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
  return card(p).replace(
    '<article class="product-card">',
    '<article class="product-card arrival-card" data-arrival-category="' + esc(p.categoryId) + '">',
  );
}

// Shared helpers are imported by page generators; records remain read-only.
export {
  categories,
  officeLocation,
  indexCatalogue,
  productCount,
  downloadProductCount,
  arrivalSkus,
  newBadge,
  familyNames,
  catalogueNavigation,
  email,
  whatsapp,
  whatsappIcon,
  customSection,
  breadcrumb,
  homeSlider,
  arrivalProducts,
  arrivalCard,
};
