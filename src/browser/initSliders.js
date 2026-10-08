// Carousel measurements, manual controls, autoplay and observer lifecycle.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initSliders() {
  // Auto-advance only visible carousels. Focus, hover and touch stop motion while browsing.
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const cards = [...track.children];
    if (!cards.length) return;
    const controls = slider.querySelector('.slider-controls');
    const position = slider.querySelector('.slider-position');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches || slider.hasAttribute('data-static-slider');
    let visible = false;
    let hovered = false;
    let interacting = false;
    let lastInteraction = 0;
    let frame = 0;
    let offsets = [];
    let step = 0;
    // Read geometry only when the track changes size, rather than during every scroll.
    const measure = () => {
      const origin = cards[0].offsetLeft;
      offsets = cards.map((card) => card.offsetLeft - origin);
      step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    };
    controls.hidden = false;
    if (slider.hasAttribute('data-mobile-only')) {
      const mobile = matchMedia('(max-width: 760px)');
      const updateTab = () => (track.tabIndex = mobile.matches ? 0 : -1);
      updateTab();
      mobile.addEventListener('change', updateTab);
    }
    const current = () =>
      offsets.reduce(
        (best, offset, index) =>
          Math.abs(offset - track.scrollLeft) < Math.abs(offsets[best] - track.scrollLeft)
            ? index
            : best,
        0,
      );
    const familyButtons = [...slider.querySelectorAll('[data-family-index]')];
    const familyNavigation = slider.querySelector('.family-navigation');
    if (familyNavigation) familyNavigation.hidden = false;
    familyButtons.forEach((button, index) =>
      button.addEventListener('click', () => {
        lastInteraction = Date.now();
        track.scrollTo({
          left: offsets[index],
          behavior: motion.matches ? 'auto' : 'smooth',
        });
      }),
    );
    const update = () => {
      frame = 0;
      const selected = current();
      position.textContent = `${selected + 1} / ${cards.length}`;
      familyButtons.forEach((button, index) =>
        button.setAttribute('aria-pressed', String(index === selected)),
      );
    };
    const advance = (direction) => {
      const max = track.scrollWidth - track.clientWidth;
      let target = track.scrollLeft + direction * step;
      if (direction > 0 && track.scrollLeft >= max - 2) target = 0;
      if (direction < 0 && track.scrollLeft <= 2) target = max;
      track.scrollTo({
        left: Math.max(0, Math.min(max, target)),
        behavior: motion.matches ? 'auto' : 'smooth',
      });
    };
    const manual = (direction) => {
      lastInteraction = Date.now();
      advance(direction);
    };
    slider.querySelector('[data-slider-prev]').addEventListener('click', () => manual(-1));
    slider.querySelector('[data-slider-next]').addEventListener('click', () => manual(1));
    track.addEventListener('keydown', (event) => {
      if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      manual(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener(
      'scroll',
      () => {
        if (!frame) frame = requestAnimationFrame(update);
      },
      { passive: true },
    );
    slider.addEventListener('mouseenter', () => {
      hovered = true;
    });
    slider.addEventListener('mouseleave', () => {
      hovered = false;
      lastInteraction = Date.now();
    });
    track.addEventListener(
      'pointerdown',
      () => {
        interacting = true;
        lastInteraction = Date.now();
      },
      { passive: true },
    );
    window.addEventListener(
      'pointerup',
      () => {
        interacting = false;
        lastInteraction = Date.now();
      },
      { passive: true },
    );
    window.addEventListener(
      'pointercancel',
      () => {
        interacting = false;
      },
      { passive: true },
    );
    motion.addEventListener('change', () => {
      paused = motion.matches || slider.hasAttribute('data-static-slider');
      update();
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(slider);
    const resizeObserver = new ResizeObserver(() => {
      measure();
      update();
    });
    resizeObserver.observe(track);
    const timer = setInterval(() => {
      if (
        !paused &&
        visible &&
        !document.hidden &&
        !hovered &&
        !interacting &&
        !slider.contains(document.activeElement) &&
        Date.now() - lastInteraction >= 5000
      )
        advance(1);
    }, 5000);
    window.addEventListener(
      'pagehide',
      (event) => {
        // A cached page resumes its timers when visitors return with Back.
        if (event.persisted) return;
        clearInterval(timer);
        observer.disconnect();
        resizeObserver.disconnect();
      },
      { once: true },
    );
    measure();
    update();
  });
}
