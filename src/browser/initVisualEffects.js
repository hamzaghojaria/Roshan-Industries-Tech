// Motion-aware reveals, panel spotlights and contact shortcut visibility.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initVisualEffects() {
  // Reveal below-the-fold sections once; respect reduced-motion preferences.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Draw the manufacturing connectors once, without hiding any step content.
  const processes = document.querySelectorAll('.custom-grid');
  let processObserver;
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    processObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.remove('process-pending');
            entry.target.classList.add('process-ready');
            processObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.15 },
    );
    processes.forEach((process) => {
      process.classList.add('process-pending');
      processObserver.observe(process);
    });
  }
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      processObserver?.disconnect();
      processes.forEach((process) => {
        process.classList.remove('process-pending');
        process.classList.add('process-ready');
      });
    }
  });
  // Hide the mobile shortcut where enquiry buttons, pagination or the footer are visible.
  const floatingWhatsApp = document.querySelector('.floating-whatsapp');
  if (floatingWhatsApp && 'IntersectionObserver' in window) {
    const visibleContactAreas = new Set();
    const contactObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleContactAreas.add(entry.target);
        else visibleContactAreas.delete(entry.target);
      }
      floatingWhatsApp.hidden = visibleContactAreas.size > 0;
    });
    document
      .querySelectorAll('.enquiry-actions, .pagination, .arrival-filters, footer')
      .forEach((area) => contactObserver.observe(area));
  }
  // Soft cursor spotlights add depth to shared feature panels without tilting content.
  const showcases = document.querySelectorAll(
    '.hero-visual, .page-intro, .detail-image, .custom-enquiry',
  );
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  for (const showcase of showcases) {
    showcase.classList.add('interactive-spotlight');
    showcase.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const bounds = showcase.getBoundingClientRect();
      showcase.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      showcase.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
      showcase.classList.add('spotlight-active');
    });
    showcase.addEventListener('pointerleave', () => showcase.classList.remove('spotlight-active'));
    reducedMotion.addEventListener('change', () => showcase.classList.remove('spotlight-active'));
  }
  // Content is always visible; entrance effects start only when it reaches the viewport.
  const entrances =
    'main > section:first-of-type:not(.hero):not(.product-detail), .hero-copy, .page-intro, .detail-image, .detail-copy, .hero-product, .hero-small > a';
  const reveals =
    '.section-head, .legacy-layout, .about-story, .about-numbers, .contact-layout, .enquiry-strip, .custom-heading, .custom-grid article, .product-card, .category-card, .generation-card, .office-card';
  const scheduled = new WeakSet();
  let revealObserver;
  let listingObserver;
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-enter');
            revealObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    const schedule = (scope) => {
      scope.querySelectorAll(`${entrances}, ${reveals}`).forEach((element) => {
        if (scheduled.has(element)) return;
        scheduled.add(element);
        const siblings = [...element.parentElement.children];
        const delay = element.matches('.hero-product')
          ? 90
          : element.matches('.hero-small > a')
            ? 180 + siblings.indexOf(element) * 90
            : (siblings.indexOf(element) % 6) * 45;
        element.style.setProperty('--motion-delay', `${delay}ms`);
        revealObserver.observe(element);
      });
    };
    schedule(document);
    listingObserver = new MutationObserver(() => schedule(document));
    document.querySelectorAll('.catalogue-grid, .arrivals-grid').forEach((grid) => {
      listingObserver.observe(grid, { childList: true });
    });
    const banner = document.querySelector('.hero-visual');
    if (banner) {
      const bannerObserver = new IntersectionObserver(([entry]) => {
        banner.classList.toggle('banner-floating', entry.isIntersecting && !reducedMotion.matches);
      });
      bannerObserver.observe(banner);
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
          bannerObserver.disconnect();
          banner.classList.remove('banner-floating');
        }
      });
    }
  }
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    revealObserver?.disconnect();
    listingObserver?.disconnect();
    document
      .querySelectorAll('.motion-enter')
      .forEach((element) => element.classList.remove('motion-enter'));
  });
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('motion-paused', document.hidden);
  });
}
