// Generate the productPage route using shared accessible components.
import {
  categories,
  indexCatalogue,
  newBadge,
  esc,
  whatsapp,
  whatsappIcon,
  mail,
  customMail,
  card,
  layout,
  breadcrumb,
  homeSlider,
  productPhoto,
} from './shared.mjs';

/** Product details, grounded descriptions, enquiry links and related products. */
export function productPage(p, products) {
  const related = (indexCatalogue(products).byCategory.get(p.categoryId) || [])
    .filter((q) => q.id !== p.id)
    .slice(0, 4);
  return layout(
    p.name,
    /* HTML */ `${breadcrumb(p.name, '../', /* HTML */ `<a href="../catalogue.html">Products</a><span>/</span><a href="../categories/${p.categoryId}.html">${esc(p.category)}</a><span>/</span>`)}
      <section class="container product-detail">
        <div class="detail-image">
          <div class="product-photo">${productPhoto(p, '../')}</div>
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
          <p class="product-note">
            Please contact Roshan Industries to confirm the required variant, application, quantity
            and quotation.
          </p>
          <dl class="spec-table">
            <div>
              <dt>SKU</dt>
              <dd>${p.sku}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd><a href="../categories/${p.categoryId}.html">${esc(p.category)}</a></dd>
            </div>
            ${
              p.cataloguePage
                ? `<div>
              <dt>Catalogue reference</dt>
              <dd>Page ${p.cataloguePage}</dd>
            </div>`
                : ''
            }
            ${(p.specifications || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}
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
          <div
            class="product-catalogue-actions${p.cataloguePage ? '' : ' product-catalogue-actions-single'}"
          >
            ${
              p.cataloguePage
                ? `<a
              class="button button-light"
              href="../assets/roshan-industries-catalogue.pdf#page=${p.cataloguePage}"
              target="_blank"
              rel="noopener"
              >Explore in catalogue &#8599;</a
            >`
                : ''
            }
            <a
              class="button button-light"
              href="../assets/roshan-industries-catalogue.pdf"
              download="Roshan-Industries-Catalogue.pdf"
              >Download catalogue &#8595;</a
            >
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
                ${homeSlider(
                  'related',
                  'Products in the same category',
                  related.map((q) => card(q, '../')).join(''),
                )
                  .replace(
                    'class="home-slider" data-slider',
                    'class="home-slider related-slider" data-static-slider data-mobile-only data-slider',
                  )
                  .replace('class="slider-track"', 'class="slider-track product-grid"')}
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
