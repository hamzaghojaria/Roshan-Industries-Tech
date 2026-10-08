// Generate the newArrivalsPage route using shared accessible components.
import { esc, layout, breadcrumb, arrivalProducts, arrivalCard } from './shared.mjs';

/** Curated arrivals with category filters, stable SKUs and native browsing fallback. */
export function newArrivalsPage(products) {
  const arrivals = arrivalProducts(products);
  if (!arrivals.length) {
    return layout(
      'New Arrivals',
      breadcrumb('New Arrivals') +
        '<section class="container arrivals-intro"><p class="eyebrow">NEW ARRIVALS</p><h1>New to the Roshan Industries range.</h1><p>New additions will appear here as they become available.</p></section>' +
        '<section class="container arrivals-section"><div class="arrivals-more"><p>Explore our current product range.</p><a class="button button-navy" href="catalogue.html">Browse all products &#8594;</a></div></section>',
      {
        active: 'arrivals',
        page: 'arrivals',
        description:
          'Check for new additions to Roshan Industries or explore the complete product catalogue.',
      },
    );
  }
  const groups = [...new Map(arrivals.map((p) => [p.categoryId, p.category])).entries()];
  return layout(
    'New Arrivals',
    breadcrumb('New Arrivals') +
      '<section class="container arrivals-intro"><p class="eyebrow">DISCOVER WHAT’S NEW</p><h1>New to the Roshan Industries range.</h1><p>Explore the latest additions to our online range. Find a product and speak with our team about your requirements.</p></section>' +
      '<section class="container arrivals-section" aria-label="New arrival products"><div class="arrivals-toolbar"><div class="arrival-filters" role="group" aria-label="Filter new arrivals by category" hidden><button type="button" data-arrival-filter="all" aria-pressed="true">All arrivals</button>' +
      groups
        .map(
          ([id, name]) =>
            '<button type="button" data-arrival-filter="' +
            esc(id) +
            '" aria-pressed="false">' +
            esc(name) +
            '</button>',
        )
        .join('') +
      '</div></div><div class="product-grid arrivals-grid">' +
      arrivals.map(arrivalCard).join('') +
      '</div><nav id="arrival-pagination" class="pagination" aria-label="New arrivals pages" hidden></nav><div class="arrivals-more"><p>Looking for something else?</p><a class="text-link" href="catalogue.html">Explore the complete catalogue &#8594;</a></div></section>',
    {
      active: 'arrivals',
      page: 'arrivals',
      description:
        'Explore new additions to the Roshan Industries online product range. View product details and enquire about specifications and availability.',
    },
  );
}
