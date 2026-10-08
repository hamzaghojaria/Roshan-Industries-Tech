// Generate the cataloguePage route using shared accessible components.
import {
  categories,
  indexCatalogue,
  productCount,
  familyNames,
  esc,
  card,
  layout,
  breadcrumb,
} from './shared.mjs';

/** Render catalogue cards and controls for progressive filtering and pagination. */
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
            >All products <span>${productCount}</span></a
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
            <div class="catalogue-controls">
              <div>
                <label for="sort">Sort by</label
                ><select id="sort">
                  <option value="catalogue">Catalogue order</option>
                  <option value="new" class="new-sort-option">New Arrivals first</option>
                  <option value="asc">Name: A–Z</option>
                  <option value="desc">Name: Z–A</option>
                  <option value="sku">SKU</option>
                </select>
              </div>
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
