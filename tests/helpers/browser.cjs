// Shared Playwright loading and browser selection for every browser regression check.
const path = require('node:path');
const { createRequire } = require('node:module');
let engine;
try {
  ({ chromium: engine } = require('playwright-core'));
} catch (error) {
  // Only fall back when the package is absent, not when its initialization fails.
  if (
    error.code !== 'MODULE_NOT_FOUND' ||
    !error.message.includes("Cannot find module 'playwright-core'")
  )
    throw error;
  ({ chromium: engine } = createRequire(
    path.resolve(__dirname, '../../../.site-tools/qa/package.json'),
  )('playwright-core'));
}

const chromium = {
  /** BROWSER_PATH works on any OS; EDGE_PATH remains supported for existing setups. */
  launch(options = {}) {
    const executablePath =
      process.env.BROWSER_PATH ||
      process.env.EDGE_PATH ||
      options.executablePath ||
      (process.platform === 'win32'
        ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
        : undefined);
    return engine.launch({ ...options, executablePath });
  },
};
module.exports = { chromium };
