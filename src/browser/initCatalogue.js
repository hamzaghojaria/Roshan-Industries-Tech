// Catalogue search, family and arrival filters, sorting and pagination.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initCatalogue() {
  // Catalogue controls are installed only on catalogue/category listing pages.
  const section = document.querySelector('[data-catalogue]');
  if (!section) return;

  // Reuse server-generated cards; never recreate product HTML from user input.
  // Look up each card by SKU directly rather than scanning the whole catalogue per card.
  const products = new Map((window.ROSHAN_PRODUCTS || []).map((product) => [product.sku, product]));
  const normalize = (value) =>
    value.normalize('NFKD').toLowerCase().replace(/[–—]/g, '-').replace(/×/g, 'x');
  const grid = document.getElementById('catalogue-grid');
  const items = [...grid.querySelectorAll('.product-card')].map((node) => {
    const href = node.querySelector('.product-image').getAttribute('href');
    const sku = href.split('/').pop().replace('.html', '').toUpperCase();
    const product = products.get(sku);
    // Search text is fixed for each product; normalise once rather than on every keystroke.
    const searchText = normalize(
      `${product.name} ${product.sku} ${product.category} ${product.id} ${(product.specifications || []).map((s) => s.value).join(' ')}`,
    );
    return {
      node,
      product,
      searchText,
      isArrival: Boolean(node.querySelector('.arrival-badge')),
    };
  });
  const queryInput = document.getElementById('catalogue-query');
  const count = document.getElementById('results-count');
  const pagination = document.getElementById('pagination');
  const requestedFamily = new URLSearchParams(location.search).get('family') || '';
  const state = {
    page: Math.max(1, Number(new URLSearchParams(location.search).get('page')) || 1),
    query: new URLSearchParams(location.search).get('q') || '',
    sort: ['new', 'asc', 'desc', 'sku'].includes(new URLSearchParams(location.search).get('sort'))
      ? new URLSearchParams(location.search).get('sort')
      : 'catalogue',
    arrivals: new URLSearchParams(location.search).get('new') === '1',
    family:
      section.dataset.catalogue === 'all' &&
      items.some(({ product }) => product.family === requestedFamily)
        ? requestedFamily
        : '',
  };
  // Use the same compact page size for all product and category listings.
  const pageSize = 12;
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  queryInput.value = state.query;
  const arrivalFilter = document.getElementById('arrival-filter');
  if (arrivalFilter) arrivalFilter.value = state.arrivals ? 'new' : 'all';
  arrivalFilter?.addEventListener('change', () => {
    state.arrivals = arrivalFilter.value === 'new';
    state.page = 1;
    const url = new URL(location.href);
    if (state.arrivals) url.searchParams.set('new', '1');
    else url.searchParams.delete('new');
    history.replaceState(history.state, '', url.href);
    render();
  });

  // Match all query words, sort, slice the current page and announce results.
  function render() {
    const words = normalize(state.query.trim()).split(/\s+/).filter(Boolean);
    const matches = items.filter(
      ({ searchText, product, isArrival }) =>
        (!state.family || product.family === state.family) &&
        (!state.arrivals || isArrival) &&
        words.every((word) => searchText.includes(word)),
    );
    if (state.sort === 'asc' || state.sort === 'desc')
      matches.sort(
        (a, b) => (state.sort === 'asc' ? 1 : -1) * a.product.name.localeCompare(b.product.name),
      );
    document.getElementById('sort').value = state.sort;
    document.getElementById('sort').classList.toggle('is-new-sort', state.sort === 'new');
    if (state.sort === 'new')
      matches.sort(
        (a, b) =>
          Number(b.isArrival) - Number(a.isArrival) ||
          (a.isArrival
            ? b.product.sku.localeCompare(a.product.sku, undefined, { numeric: true })
            : 0),
      );
    if (state.sort === 'sku') matches.sort((a, b) => a.product.sku.localeCompare(b.product.sku));
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    state.page = Number.isSafeInteger(state.page) ? Math.max(1, Math.min(state.page, pages)) : 1;
    const start = (state.page - 1) * pageSize;
    const visible = matches.slice(start, start + pageSize);
    grid.replaceChildren(...visible.map((item) => item.node));
    count.textContent = matches.length
      ? `Showing ${start + 1}–${start + visible.length} of ${matches.length} products`
      : '0 products';
    document.getElementById('empty-state').hidden = matches.length > 0;
    renderPages(pagination, state.page, pages);
    const url = new URL(location.href);
    state.page === 1 ? url.searchParams.delete('page') : url.searchParams.set('page', state.page);
    if (url.href !== location.href) history.replaceState(history.state, '', url.href);
  }
  // Preserve catalogue filters in the URL without changing the separate header search.
  function updateQuery() {
    state.query = queryInput.value;
    state.page = 1;
    const url = new URL(location.href);
    if (state.query) url.searchParams.set('q', state.query);
    else url.searchParams.delete('q');
    history.replaceState(history.state, '', url.href);
    render();
  }
  // Delegate pagination clicks because buttons are recreated during rendering.
  queryInput.addEventListener('input', updateQuery);
  document.getElementById('reset-search').addEventListener('click', () => {
    queryInput.value = '';
    updateQuery();
  });
  document.getElementById('sort').addEventListener('change', (event) => {
    state.sort = event.target.value;
    const url = new URL(location.href);
    state.sort === 'catalogue'
      ? url.searchParams.delete('sort')
      : url.searchParams.set('sort', state.sort);
    history.replaceState(history.state, '', url.href);
    state.page = 1;
    render();
  });
  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    render();
    section.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    const current = pagination.querySelector('[aria-current="page"]');
    if (current) current.focus({ preventScroll: true });
  });
  document.getElementById('category-jump').addEventListener('change', (event) => {
    location.href = event.target.value;
  });
  render();
}
