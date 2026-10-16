const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto('http://localhost:3000/brands', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check image src in first 16 product cards
  const imgSrcs = await page.$$eval('#brand-products-grid img', imgs => imgs.slice(0, 16).map((img, i) => ({
    index: i,
    src: img.src.replace('http://localhost:3000', ''),
    naturalWidth: img.naturalWidth
  })));
  console.log('Product card images in DOM (first 16):', imgSrcs);

  const brandSection = await page.$('section[aria-label="Brand Selection"]');
  if (brandSection) {
    await brandSection.screenshot({ path: 'public/brand-selection-cards-evidence.png' });
    console.log('Saved public/brand-selection-cards-evidence.png');
  }

  const grid = await page.$('#brand-products-grid');
  if (grid) await grid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/brand-products-grid-focus.png', fullPage: false });
  console.log('Saved public/brand-products-grid-focus.png');

  // Capture controls and top row of cards (matching media_1792168555180_94df499b.png)
  await page.evaluate(() => {
    const controls = document.querySelector('.flex.items-center.justify-between.pt-2');
    if (controls) controls.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/brand-catalog-flow-match.png', fullPage: false });
  console.log('Saved public/brand-catalog-flow-match.png');

  await browser.close();
})();

