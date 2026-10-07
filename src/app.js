// Progressive enhancement: every page remains readable without JavaScript.
(() => {
  'use strict';
  // Hosted home links use the directory root; preserve index.html for file previews.
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach((link) => {
      const target = new URL(link.href);
      if (target.protocol === 'file:' && target.pathname.endsWith('/')) {
        target.pathname += 'index.html';
        link.href = target.href;
      }
    });
  } else if (location.pathname.endsWith('/index.html')) {
    const home = new URL(location.href);
    home.pathname = home.pathname.slice(0, -'index.html'.length);
    history.replaceState(null, '', home.href);
  }
  // Batch sticky-header updates to animation frames.
  const header = document.querySelector('header');
  // Collapse mobile navigation only with JavaScript; links stay available without it.
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  const mobileViewport = matchMedia('(max-width: 760px)');
  const setMenu = (open) => {
    navigation.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open && mobileViewport.matches ? 'Close menu' : 'Menu';
  };
  document.body.classList.add('js-nav');
  setMenu(!mobileViewport.matches);
  menuToggle.addEventListener('click', () =>
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'),
  );
  mobileViewport.addEventListener('change', () => setMenu(!mobileViewport.matches));
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobileViewport.matches) setMenu(false);
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileViewport.matches) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  // Apply one measured anchor offset; do not add a second section scroll margin.
  const updateAnchorOffset = () => {
    const sticky = getComputedStyle(header).position === 'sticky';
    const offset = sticky ? Math.ceil(header.getBoundingClientRect().height) + 16 : 16;
    document.documentElement.style.setProperty('--anchor-offset', `${offset}px`);
  };
  updateAnchorOffset();
  if ('ResizeObserver' in window) new ResizeObserver(updateAnchorOffset).observe(header);
  addEventListener('resize', updateAnchorOffset);
  // Correct a cross-page hash landing after the mobile menu and header are ready.
  const alignInitialAnchor = () => {
    updateAnchorOffset();
    const target =
      location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  if (location.hash) requestAnimationFrame(alignInitialAnchor);
  let scrollQueued = false;
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', scrollY > 30);
    scrollQueued = false;
  };
  updateHeader();
  addEventListener(
    'scroll',
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(updateHeader);
      }
    },
    { passive: true },
  );
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
  // Auto-advance only visible carousels. Focus, hover and touch stop motion while browsing.
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const cards = [...track.children];
    const controls = slider.querySelector('.slider-controls');
    const position = slider.querySelector('.slider-position');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches;
    let visible = false;
    let hovered = false;
    let interacting = false;
    let lastInteraction = 0;
    let frame = 0;
    controls.hidden = false;
    const current = () =>
      cards.reduce(
        (best, card, index) =>
          Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) <
          Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft)
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
          left: cards[index].offsetLeft - cards[0].offsetLeft,
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
      const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
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
      paused = motion.matches;
      update();
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(slider);
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
      },
      { once: true },
    );
    window.addEventListener('resize', update, { passive: true });
    update();
  });
  const arrivalFilters = document.querySelector('.arrival-filters');
  if (arrivalFilters) {
    arrivalFilters.hidden = false;
    const cards = [...document.querySelectorAll('[data-arrival-category]')];
    arrivalFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-arrival-filter]');
      if (!button) return;
      const category = button.dataset.arrivalFilter;
      if (matchMedia('(max-width: 640px)').matches) {
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
      arrivalFilters
        .querySelectorAll('button')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      cards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.arrivalCategory !== category;
      });
    });
  }
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
      `${product.name} ${product.sku} ${product.category} ${product.id}`,
    );
    return { node, product, searchText };
  });
  const queryInput = document.getElementById('catalogue-query');
  const count = document.getElementById('results-count');
  const pagination = document.getElementById('pagination');
  const requestedFamily = new URLSearchParams(location.search).get('family') || '';
  const state = {
    page: 1,
    query: new URLSearchParams(location.search).get('q') || '',
    sort: 'catalogue',
    family:
      section.dataset.catalogue === 'all' &&
      items.some(({ product }) => product.family === requestedFamily)
        ? requestedFamily
        : '',
  };
  const pageSize = 24;
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  queryInput.value = state.query;

  // Match all query words, sort, slice the current page and announce results.
  function render() {
    const words = normalize(state.query.trim()).split(/\s+/).filter(Boolean);
    const matches = items.filter(
      ({ searchText, product }) =>
        (!state.family || product.family === state.family) &&
        words.every((word) => searchText.includes(word)),
    );
    if (state.sort === 'asc' || state.sort === 'desc')
      matches.sort(
        (a, b) => (state.sort === 'asc' ? 1 : -1) * a.product.name.localeCompare(b.product.name),
      );
    if (state.sort === 'sku') matches.sort((a, b) => a.product.sku.localeCompare(b.product.sku));
    const pages = Math.max(1, Math.ceil(matches.length / pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * pageSize;
    const visible = matches.slice(start, start + pageSize);
    grid.replaceChildren(...visible.map((item) => item.node));
    count.textContent = matches.length
      ? `Showing ${start + 1}–${start + visible.length} of ${matches.length} products`
      : '0 products';
    document.getElementById('empty-state').hidden = matches.length > 0;
    pagination.replaceChildren();
    if (pages > 1) {
      const button = (label, page, disabled = false) => {
        const node = document.createElement('button');
        node.type = 'button';
        node.textContent = label;
        node.dataset.page = page;
        node.disabled = disabled;
        if (Number(page) === state.page && /^\d+$/.test(label)) {
          node.className = 'current';
          node.setAttribute('aria-current', 'page');
        }
        if (/^\d+$/.test(label)) node.setAttribute('aria-label', `Page ${page}`);
        pagination.append(node);
      };
      button('Previous', state.page - 1, state.page === 1);
      // Show at most three numbers, keeping the current page within the window.
      const firstPage = Math.max(1, Math.min(state.page - 1, pages - 2));
      const lastPage = Math.min(pages, firstPage + 2);
      const ellipsis = () => {
        const node = document.createElement('span');
        node.className = 'pagination-ellipsis';
        node.textContent = '…';
        node.setAttribute('aria-label', 'More pages');
        pagination.append(node);
      };
      if (firstPage > 1) ellipsis();
      for (let page = firstPage; page <= lastPage; page++) button(String(page), page);
      if (lastPage < pages) ellipsis();
      button('Next', state.page + 1, state.page === pages);
    }
  }
  // Preserve catalogue filters in the URL without changing the separate header search.
  function updateQuery() {
    state.query = queryInput.value;
    state.page = 1;
    const url = new URL(location.href);
    if (state.query) url.searchParams.set('q', state.query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url.href);
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
})();
