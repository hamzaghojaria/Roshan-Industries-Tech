// Motion-aware reveals, panel spotlights and contact shortcut visibility.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initVisualEffects() {
  // Reveal below-the-fold sections once; respect reduced-motion preferences.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed');
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        '.section-head, .legacy-layout, .about-story, .about-numbers, .contact-layout, .enquiry-strip',
      )
      .forEach((element) => {
        if (element.getBoundingClientRect().top > innerHeight) observer.observe(element);
      });
  }
}
