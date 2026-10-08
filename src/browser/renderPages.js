// Shared accessible pagination controls for catalogue and arrivals listings.
/** Replace page controls and preserve accessible current-page and navigation labels. */
function renderPages(container, current, pages) {
  container.replaceChildren();
  if (pages > 1) {
    const button = (label, page, disabled = false) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.textContent = label;
      node.dataset.page = page;
      node.disabled = disabled;
      if (Number(page) === current && /^\d+$/.test(label)) {
        node.className = 'current';
        node.setAttribute('aria-current', 'page');
      }
      if (/^\d+$/.test(label)) node.setAttribute('aria-label', `Page ${page}`);
      container.append(node);
    };
    button('Previous', current - 1, current === 1);
    // Show at most three numbers, keeping the current page within the window.
    const firstPage = Math.max(1, Math.min(current - 1, pages - 2));
    const lastPage = Math.min(pages, firstPage + 2);
    const ellipsis = () => {
      const node = document.createElement('span');
      node.className = 'pagination-ellipsis';
      node.textContent = '…';
      node.setAttribute('aria-label', 'More pages');
      container.append(node);
    };
    if (firstPage > 1) ellipsis();
    for (let page = firstPage; page <= lastPage; page++) button(String(page), page);
    if (lastPage < pages) ellipsis();
    button('Next', current + 1, current === pages);
  }
}
