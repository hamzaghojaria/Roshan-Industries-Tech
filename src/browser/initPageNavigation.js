// Local preview links, navigation loading, mobile menu and measured sticky anchors.
/** Initialize only when this feature's DOM is present; keep state local to the page. */
function initPageNavigation() {
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
}
