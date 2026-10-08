// New Arrivals category filtering, pagination and URL-backed selection.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initArrivals() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const arrivalFilters = document.querySelector('.arrival-filters');
  if (arrivalFilters) {
    arrivalFilters.hidden = false;
    const cards = [...document.querySelectorAll('[data-arrival-category]')];
    const grid = document.querySelector('.arrivals-grid');
    const pagination = document.getElementById('arrival-pagination');
    const categories = new Set(['all', ...cards.map((card) => card.dataset.arrivalCategory)]);
    // Keep New Arrivals compact on mobile and desktop.
    const pageSize = 12;
    let category = 'all',
      page = 1;
    const read = () => {
      const params = new URLSearchParams(location.search);
      category = categories.has(params.get('category')) ? params.get('category') : 'all';
      const requested = Number(params.get('page'));
      page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
    };
    const render = (push = false) => {
      const matches = cards.filter(
        (card) => category === 'all' || card.dataset.arrivalCategory === category,
      );
      const pages = Math.max(1, Math.ceil(matches.length / pageSize));
      page = Math.min(page, pages);
      grid.replaceChildren(...matches.slice((page - 1) * pageSize, page * pageSize));
      arrivalFilters
        .querySelectorAll('button')
        .forEach((button) =>
          button.setAttribute('aria-pressed', String(button.dataset.arrivalFilter === category)),
        );
      renderPages(pagination, page, pages);
      pagination.hidden = pages <= 1;
      const url = new URL(location.href);
      category === 'all'
        ? url.searchParams.delete('category')
        : url.searchParams.set('category', category);
      page === 1 ? url.searchParams.delete('page') : url.searchParams.set('page', page);
      if (url.href !== location.href)
        history[push ? 'pushState' : 'replaceState'](null, '', url.href);
    };
    read();
    render();
    window.addEventListener('popstate', () => {
      read();
      render();
    });
    pagination.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      page = Number(button.dataset.page);
      render(true);
      arrivalFilters.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
      pagination.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
    });
    arrivalFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-arrival-filter]');
      if (!button) return;
      category = button.dataset.arrivalFilter;
      {
        const filterBounds = arrivalFilters.getBoundingClientRect();
        const buttonBounds = button.getBoundingClientRect();
        const offset =
          buttonBounds.left < filterBounds.left + 3
            ? buttonBounds.left - filterBounds.left - 3
            : buttonBounds.right > filterBounds.right - 3
              ? buttonBounds.right - filterBounds.right + 3
              : 0;
        if (offset)
          arrivalFilters.scrollBy({
            left: offset,
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
          });
      }
      page = 1;
      render(true);
    });
  }
}
