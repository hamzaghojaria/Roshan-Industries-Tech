// Generate the home route using shared accessible components.
import {
  categories,
  indexCatalogue,
  productCount,
  customSection,
  card,
  categoryCard,
  layout,
  homeSlider,
} from './shared.mjs';

/** Homepage manufacturing story, featured categories and product discovery. */
export function home(products) {
  // Feature the expanded manufacturing range alongside jewellery bench tools.
  const featuredCategories = [
    'tube-instrumentation-fittings',
    'hydraulic-hose-fittings',
    'valve-bodies-manifolds',
    'pressure-gauge-accessories',
    'custom-machined-components',
    'jewellery-tools',
  ].map((id) => categories.find((category) => category.id === id));
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
                src="assets/products/rit-0156-nine-hole-screwdriver-stand-with-screwdrivers.webp"
                alt="Roshan Industries precision screwdriver stand"
                width="480"
                height="480"
              /><span>THE WATCHMAKER’S BENCH</span>
            </a>
            <div class="hero-small">
              <a href="categories/eye-loupes.html"
                ><img
                  src="assets/products/rit-0001-plastic-eye-glass-with-golden-ring.webp"
                  alt="Roshan Industries plastic eye loupes"
                  width="480"
                  height="480"
                /><span>Eye loupes & magnifiers</span></a
              ><a href="categories/clock-keys.html"
                ><img
                  src="assets/products/rit-0119-brass-clock-key-sizes-1-75-to-3-00.webp"
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
        <div>
          <strong>${productCount} products</strong><span>Organised for the way you work</span>
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
            <h2>Browse our categories</h2>
          </div>
          <a class="text-link home-browse-link" href="categories.html">View all categories</a>
        </div>
        ${homeSlider(
          'trades',
          'Product categories',
          featuredCategories.map((c) => categoryCard(c, products)).join(''),
        )}
      </section>
      <section class="section section-muted">
        <div class="container">
          <div class="section-head">
            <div>
              <p class="eyebrow">FROM THE ROSHAN INDUSTRIES CATALOGUE</p>
              <h2>Explore the range</h2>
            </div>
            <a class="text-link home-browse-link" href="catalogue.html">Browse all products</a>
          </div>
          ${homeSlider('range', 'Featured products', featured.map((p) => card(p)).join(''))}
        </div>
      </section>
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
