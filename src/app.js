// Progressive enhancement: every page remains readable without JavaScript.
(() => {
  'use strict';
  const hidePageLoader = () => document.documentElement.classList.remove('page-loading');
  hidePageLoader();
  window.addEventListener('pageshow', hidePageLoader);
  // Header suggestions use the same catalogue records as product listings.
  const searchInput = document.getElementById('search');
  const suggestions = document.getElementById('search-suggestions');
  if (searchInput && suggestions && window.ROSHAN_PRODUCTS) {
    const form = searchInput.form;
    const base = new URL('.', form.action);
    const clean = (value) =>
      String(value)
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const records = window.ROSHAN_PRODUCTS.map((product) => ({
      product,
      text: clean(`${product.name} ${product.sku} ${product.category} ${product.family}`),
    }));
    const categories = [
      ...new Map(records.map(({ product }) => [product.categoryId, product])).values(),
    ];
    const announcement = document.getElementById('search-announcement');
    let active = -1,
      options = [],
      timer;
    searchInput.setAttribute('role', 'combobox');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-controls', suggestions.id);
    searchInput.setAttribute('aria-expanded', 'false');
    const close = () => {
      clearTimeout(timer);
      suggestions.hidden = true;
      active = -1;
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.removeAttribute('aria-activedescendant');
    };
    const renderSuggestions = () => {
      const query = clean(searchInput.value);
      if (query.length < 2) {
        close();
        announcement.textContent = '';
        return;
      }
      const words = query.split(' ');
      const matches = records
        .filter((record) => words.every((word) => record.text.includes(word)))
        .sort(
          (a, b) =>
            Number(clean(b.product.sku) === query) - Number(clean(a.product.sku) === query) ||
            Number(clean(b.product.name).startsWith(query)) -
              Number(clean(a.product.name).startsWith(query)),
        )
        .slice(0, 6);
      const groups = categories
        .filter((product) => words.every((word) => clean(product.category).includes(word)))
        .slice(0, 3);
      suggestions.replaceChildren();
      options = [];
      active = -1;
      searchInput.removeAttribute('aria-activedescendant');
      const heading = (text) => {
        const node = document.createElement('div');
        node.className = 'search-suggestion-heading';
        node.textContent = text;
        node.setAttribute('role', 'presentation');
        suggestions.append(node);
      };
      const add = (name, detail, href, image = '') => {
        const link = document.createElement('a');
        link.href = new URL(href, base).href;
        link.className = 'search-suggestion';
        link.id = 'search-option-' + options.length;
        link.setAttribute('role', 'option');
        link.setAttribute('aria-selected', 'false');
        link.tabIndex = -1;
        if (image) {
          const photo = document.createElement('img');
          photo.src = new URL(image, base).href;
          photo.alt = '';
          photo.width = 48;
          photo.height = 48;
          link.append(photo);
        }
        const copy = document.createElement('span');
        const title = document.createElement('strong');
        title.textContent = name;
        const subtitle = document.createElement('small');
        subtitle.textContent = detail;
        copy.append(title, subtitle);
        link.append(copy);
        suggestions.append(link);
        options.push(link);
      };
      if (matches.length) {
        heading('Products');
        for (const { product } of matches)
          add(product.name, `${product.sku} · ${product.category}`, product.url, product.image);
      }
      if (groups.length) {
        heading('Categories');
        for (const product of groups)
          add(product.category, product.family, `categories/${product.categoryId}.html`);
      }
      if (!matches.length && !groups.length)
        heading('No suggestions. Try a product name, category or SKU.');
      add(
        'View all search results',
        'Search the complete catalogue',
        `catalogue.html?q=${encodeURIComponent(searchInput.value.trim())}`,
      );
      const viewportBottom = window.visualViewport
        ? visualViewport.height + visualViewport.offsetTop
        : innerHeight;
      suggestions.style.setProperty(
        '--suggestions-height',
        Math.max(100, Math.min(420, viewportBottom - form.getBoundingClientRect().bottom - 16)) +
          'px',
      );
      suggestions.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
      announcement.textContent = `${matches.length} product suggestions and ${groups.length} category suggestions.`;
    };
    searchInput.addEventListener('input', () => {
      close();
      timer = setTimeout(renderSuggestions, 100);
    });
    searchInput.addEventListener('focus', renderSuggestions);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        if (suggestions.hidden) renderSuggestions();
        if (!options.length || suggestions.hidden) return;
        active =
          event.key === 'ArrowDown'
            ? (active + 1) % options.length
            : active <= 0
              ? options.length - 1
              : active - 1;
        options.forEach((option, index) =>
          option.setAttribute('aria-selected', String(index === active)),
        );
        searchInput.setAttribute('aria-activedescendant', options[active].id);
        options[active].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && !suggestions.hidden && active >= 0) {
        event.preventDefault();
        location.href = options[active].href;
      }
    });
    suggestions.addEventListener('pointerdown', (event) => {
      if (event.target.closest('a')) event.preventDefault();
    });
    document.addEventListener('pointerdown', (event) => {
      if (!form.contains(event.target)) close();
    });
    form.addEventListener('focusout', () =>
      setTimeout(() => {
        if (!form.contains(document.activeElement)) close();
      }, 0),
    );
    form.addEventListener('submit', close);
    window.addEventListener('pageshow', close);
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute('download')
    )
      return;
    const target = new URL(link.href, location.href);
    if (
      !['http:', 'https:', 'file:'].includes(target.protocol) ||
      target.origin !== location.origin ||
      !/\/$|\.html$/.test(target.pathname) ||
      (target.pathname === location.pathname && target.search === location.search)
    )
      return;
    document.documentElement.classList.add('page-loading');
    setTimeout(hidePageLoader, 4000);
  });
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
  const arrivalFilters = document.querySelector('.arrival-filters');
  if (arrivalFilters) {
    arrivalFilters.hidden = false;
    const cards = [...document.querySelectorAll('[data-arrival-category]')];
    const grid = document.querySelector('.arrivals-grid');
    const pagination = document.getElementById('arrival-pagination');
    const categories = new Set(['all', ...cards.map((card) => card.dataset.arrivalCategory)]);
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
      const pages = Math.max(1, Math.ceil(matches.length / 24));
      page = Math.min(page, pages);
      grid.replaceChildren(...matches.slice((page - 1) * 24, page * 24));
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
      page = 1;
      render(true);
    });
  }
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
    return { node, product, searchText, isArrival: Boolean(node.querySelector('.arrival-badge')) };
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
  const pageSize = 24;
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
})();
