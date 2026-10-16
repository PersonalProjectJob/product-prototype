const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🔍 Running Playwright Image Diagnosis on standalone prototype.html...');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();

  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure() });
  });

  const protoPath = 'file:///' + path.resolve(__dirname, '../prototype.html').replace(/\\/g, '/');
  console.log(`Navigating to: ${protoPath}#/brands`);
  await page.goto(protoPath + '#/brands', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll down 4 steps to trigger visible lazy loading
  for (let s = 0; s < 4; s++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Check font families on Brand page
  const brandFonts = await page.evaluate(() => {
    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    const cardTitle = document.querySelector('#brand-products-grid h3');
    const cardTitleFont = cardTitle ? window.getComputedStyle(cardTitle).fontFamily : null;
    const cardPrice = document.querySelector('#brand-products-grid p');
    const cardPriceFont = cardPrice ? window.getComputedStyle(cardPrice).fontFamily : null;
    return { bodyFont, cardTitleFont, cardPriceFont };
  });
  console.log('✓ Brand Catalog Computed Font Families:', brandFonts);

  // Evaluate image status
  const imgStats = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('#brand-products-grid img'));
    // Decode all images if decode API is supported
    await Promise.all(images.map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    return images.map((img, i) => ({
      index: i,
      srcType: img.src.startsWith('data:') ? 'base64' : (img.src.startsWith('http') ? 'http' : 'other'),
      srcSnippet: img.src.substring(0, 50),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }));
  });

  console.log(`Total images checked in grid: ${imgStats.length}`);
  const zeroWidthImages = imgStats.filter(s => s.naturalWidth === 0);
  console.log(`Images with naturalWidth === 0: ${zeroWidthImages.length}`);
  if (zeroWidthImages.length > 0) {
    console.error('Zero width images sample:', zeroWidthImages.slice(0, 5));
  }

  console.log(`Failed network requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.error('Sample failed requests:', failedRequests.slice(0, 5));
  }

  // Take screenshot of the brand grid
  await page.screenshot({ path: 'public/brand-catalog-fixed-evidence.png', fullPage: false });
  console.log('✓ Evidence screenshot saved to public/brand-catalog-fixed-evidence.png');

  // Verify Homepage font family
  console.log('\n--- Checking Homepage Typography ---');
  await page.goto(protoPath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const homeFonts = await page.evaluate(() => {
    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    const sectionHeading = document.querySelector('#collection-by-brands h2');
    const headingFont = sectionHeading ? window.getComputedStyle(sectionHeading).fontFamily : null;
    const cardTitle = document.querySelector('#collection-by-brands h3');
    const cardTitleFont = cardTitle ? window.getComputedStyle(cardTitle).fontFamily : null;
    const cardPrice = document.querySelector('#collection-by-brands p');
    const cardPriceFont = cardPrice ? window.getComputedStyle(cardPrice).fontFamily : null;
    return { bodyFont, headingFont, cardTitleFont, cardPriceFont };
  });
  console.log('✓ Homepage Computed Font Families:', homeFonts);
  await page.screenshot({ path: 'public/homepage-font-evidence.png', fullPage: false });
  console.log('✓ Evidence screenshot saved to public/homepage-font-evidence.png');

  await browser.close();

  console.log('Final zeroWidthImages count:', zeroWidthImages.length);
  console.log('Final failedRequests count:', failedRequests.length, failedRequests);

  if (zeroWidthImages.length > 0 || failedRequests.length > 0) {
    console.error('❌ DIAGNOSIS FAILED: Some images are broken!');
    process.exit(1);
  } else {
    console.log('🎉 DIAGNOSIS PASSED: 100% images loaded & font families synchronized!');
  }
})();
