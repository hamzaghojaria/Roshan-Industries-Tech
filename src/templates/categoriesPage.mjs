// Generate the categoriesPage route using shared accessible components.
import {
  categories,
  indexCatalogue,
  familyNames,
  esc,
  categoryCard,
  layout,
  breadcrumb,
} from './shared.mjs';

/** Group the current category inventory by family using the shared family order. */
export function categoriesPage(products) {
  // Compute family totals once, then reuse them for overview links and section headers.
  const index = indexCatalogue(products);
  const families = familyNames.map((name) => ({
    name,
    id: name.toLowerCase().replaceAll(' ', '-'),
    categories: categories.filter((category) => category.family === name),
    count: index.byFamily.get(name)?.length || 0,
  }));
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
        ${families.map((family) => `<a href="#family-${family.id}"><span class="eyebrow">CATEGORY FAMILY</span><strong>${esc(family.name)}</strong><span>${family.categories.length}&nbsp;categories · ${family.count}&nbsp;products</span></a>`).join('')}
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
                    >${family.categories.length}&nbsp;categories &middot;
                    ${family.count}&nbsp;products</span
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
