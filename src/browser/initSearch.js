// Header product suggestions, keyboard selection and accessible result announcements.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initSearch() {
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
      name: clean(product.name),
      sku: clean(product.sku),
      text: clean(`${product.name} ${product.sku} ${product.category} ${product.family}`),
    }));
    const categories = [
      ...new Map(records.map(({ product }) => [product.categoryId, product])).values(),
    ].map((product) => ({ product, text: clean(product.category) }));
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
            Number(b.sku === query) - Number(a.sku === query) ||
            Number(b.name.startsWith(query)) - Number(a.name.startsWith(query)),
        )
        .slice(0, 6);
      const groups = categories
        .filter(({ text }) => words.every((word) => text.includes(word)))
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
          const photoFrame = document.createElement('span');
          photoFrame.className = 'search-product-photo';
          photoFrame.append(photo);
          link.append(photoFrame);
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
        for (const { product } of groups)
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
}
