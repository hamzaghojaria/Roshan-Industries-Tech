// Browser entry point. scripts/browser-build.mjs assembles feature files before this entry.
const hidePageLoader = () => document.documentElement.classList.remove('page-loading');
hidePageLoader();
window.addEventListener('pageshow', hidePageLoader);
initSearch();
initPageNavigation();
initVisualEffects();
initSliders();
initArrivals();
initListingHistory();
initCatalogue();
