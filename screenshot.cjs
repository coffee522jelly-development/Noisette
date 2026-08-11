const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Vertical view
  const contextV = await browser.newContext({ viewport: { width: 450, height: 950 } });
  const pageV = await contextV.newPage();
  await pageV.goto('http://localhost:4173');
  await pageV.waitForTimeout(2000);
  await pageV.screenshot({ path: 'vertical.png' });
  await contextV.close();

  // Horizontal view
  const contextH = await browser.newContext({ viewport: { width: 1400, height: 600 } });
  const pageH = await contextH.newPage();
  await pageH.goto('http://localhost:4173');
  await pageH.waitForTimeout(2000);
  await pageH.screenshot({ path: 'horizontal.png' });
  await contextH.close();

  await browser.close();
})();
