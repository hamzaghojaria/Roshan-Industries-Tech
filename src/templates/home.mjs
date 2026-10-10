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
  // Feature the Precision Machining range in the banner and category carousel.
  const featuredCategories = [
    'tube-instrumentation-fittings',
    'hydraulic-hose-fittings',
    'valve-bodies-manifolds',
    'pressure-gauge-accessories',
    'custom-machined-components',
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
              href="categories/custom-machined-components.html"
              aria-label="Explore Custom Machined Components"
            >
              <img
                src="assets/products/rit-0282-customized-fasteners.jpg"
                alt="Roshan Industries custom machined components"
                width="480"
                height="480"
              /><span>CUSTOM MACHINED COMPONENTS</span>
            </a>
            <div class="hero-small">
              <a href="categories/tube-instrumentation-fittings.html"
                ><img
                  src="assets/products/rit-0284-tube-fittings.jpeg"
                  alt="Roshan Industries tube and instrumentation fittings"
                  width="480"
                  height="480"
                /><span>Tube & instrumentation fittings</span></a
              ><a href="categories/valve-bodies-manifolds.html"
                ><img
                  src="assets/products/rit-0289-check-valve-housing.jpg"
                  alt="Roshan Industries valve bodies and manifolds"
                  width="480"
                  height="480"
                /><span>Valve bodies & manifolds</span></a
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
