// Save and restore listing scroll position, filters and keyboard focus.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initListingHistory() {
  // Store browsing position on the current history entry, separately for each listing.
  const listing = document.querySelector('[data-catalogue], .arrivals-section');
  const rememberListing = (link = null) => {
    if (!listing) return;
    try {
      history.replaceState(
        {
          ...history.state,
          roshanListing: {
            scrollY,
            href: link?.getAttribute('href') || history.state?.roshanListing?.href || '',
          },
        },
        '',
        location.href,
      );
    } catch {
      /* Browsing works when history storage is unavailable. */
    }
  };
  const restoreListing = () => {
    const saved = history.state?.roshanListing;
    if (!listing || !saved || location.hash) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved.scrollY, behavior: 'instant' });
        if (saved.href)
          [...listing.querySelectorAll('a[href]')]
            .find((link) => link.getAttribute('href') === saved.href)
            ?.focus({ preventScroll: true });
      }),
    );
  };
  if (listing) {
    history.scrollRestoration = 'manual';
    document.addEventListener('click', (event) => {
      const link = event.target.closest('.product-card a[href]');
      if (link && /\/products\/[^/]+\.html$/.test(new URL(link.href).pathname))
        rememberListing(link);
    });
    window.addEventListener('pagehide', () => rememberListing());
    window.addEventListener('pageshow', (event) => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (event.persisted || ['back_forward', 'reload'].includes(navigation?.type))
        restoreListing();
    });
  }
}
