const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting Comprehensive Brand Catalog & Lazy Loading Verification...');
  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: Desktop E2E Flow (1440x960)
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Desktop Flow on http://localhost:3000 ---');
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();

    // 1.1 Load homepage
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify Hero Video on homepage is intact
    const heroVideo = await page.$('video');
    console.log('✓ Hero video present on Homepage:', Boolean(heroVideo));

    // 1.2 Click "Brands" in Navbar
    console.log('Clicking "Brands" menu in Navbar...');
    const brandsNavBtn = await page.getByRole('button', { name: 'Brands', exact: true }).first();
    await brandsNavBtn.click();
    await page.waitForTimeout(1000);

    // Verify URL
    console.log('Current URL after clicking Brands:', page.url());
    if (!page.url().includes('/brands')) {
      throw new Error(`Expected URL to contain /brands, but got ${page.url()}`);
    }

    // 1.3 Verify Hero Banner (Figma 2170:1395) & Breadcrumbs
    const bannerImg = await page.$('img[alt="Ben Thanh Luxury Brand Catalog Banner"]');
    console.log('✓ Hero Banner present:', Boolean(bannerImg));

    const breadcrumbs = await page.innerText('nav[aria-label="Breadcrumb"]');
    console.log('✓ Breadcrumbs text:', breadcrumbs.replace(/\s+/g, ' '));

    // 1.4 Verify 12 Brand Selection Cards (Figma 2170:1403)
    const brandCards = await page.$$('section[aria-label="Brand Selection"] button');
    console.log('✓ Brand Selection Cards count:', brandCards.length);
    if (brandCards.length < 12) {
      throw new Error(`Expected at least 12 brand cards, found ${brandCards.length}`);
    }

    // 1.5 Verify Initial Lazy Load = Exactly 50 items (pageSize = 50, pageNumber = 1)
    let productCards = await page.$$('#brand-products-grid > div');
    console.log(`✓ Initial rendered product cards count: ${productCards.length}`);
    if (productCards.length !== 50) {
      throw new Error(`Expected exactly 50 product cards on initial load, but got ${productCards.length}`);
    }

    // Capture Desktop initial view
    await page.screenshot({ path: 'public/brand-catalog-desktop-hero.png', fullPage: false });
    console.log('✓ Screenshot saved: public/brand-catalog-desktop-hero.png');

    // 1.6 Verify Lazy Loading: Click "View More" or scroll
    console.log('\nTesting lazy loading: interacting with "View More"...');
    const loadMoreBtn = await page.getByRole('button', { name: /(View More|Load Next)/i });
    if (!loadMoreBtn) {
      throw new Error('View More button not found');
    }

    await loadMoreBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    
    // Check count after scroll (observer trigger)
    productCards = await page.$$('#brand-products-grid > div');
    console.log(`✓ Product cards count after scrolling near bottom: ${productCards.length}`);
    if (productCards.length < 100) {
      await loadMoreBtn.click();
      await page.waitForTimeout(1000);
      productCards = await page.$$('#brand-products-grid > div');
      console.log(`✓ Product cards count after explicit click: ${productCards.length}`);
    }
    if (productCards.length < 100 || productCards.length % 50 !== 0) {
      throw new Error(`Expected product cards to be multiple of 50 (at least 100), but got ${productCards.length}`);
    }

    // 1.7 Test Brand Filter switching (click "Rolex" card)
    console.log('\nTesting brand card filter: clicking "Rolex" card...');
    const rolexCard = await page.getByRole('button', { name: /Rolex/i }).first();
    await rolexCard.scrollIntoViewIfNeeded();
    await rolexCard.click();
    await page.waitForTimeout(1000);

    // Verify breadcrumbs updated
    const updatedBreadcrumbs = await page.innerText('nav[aria-label="Breadcrumb"]');
    console.log('✓ Updated Breadcrumbs text:', updatedBreadcrumbs.replace(/\s+/g, ' '));

    // Verify Rolex products loaded with initial pageSize = 50
    const rolexCards = await page.$$('#brand-products-grid > div');
    console.log(`✓ Rolex products count (page 1): ${rolexCards.length}`);
    if (rolexCards.length !== 50) {
      throw new Error(`Expected 50 Rolex cards on initial brand selection, got ${rolexCards.length}`);
    }

    // 1.8 Verify Click Product navigates to Product Detail Page
    console.log('\nTesting Product Detail navigation from Brand Page...');
    const firstProduct = rolexCards[0];
    await firstProduct.click();
    await page.waitForTimeout(1000);
    console.log('Current URL after product click:', page.url());
    if (!page.url().includes('/index-all-brands/')) {
      throw new Error(`Expected URL to contain /index-all-brands/, but got ${page.url()}`);
    }

    // Screenshot full desktop brand catalog
    await page.goto('http://localhost:3000/brands');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/brand-catalog-desktop.png', fullPage: false });
    console.log('✓ Full Desktop screenshot: public/brand-catalog-desktop.png');
    await ctx.close();

    // ----------------------------------------------------
    // TEST 2: Tablet Viewport (768x1024)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Tablet (768x1024) ---');
    const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const tabletPage = await tabletCtx.newPage();
    await tabletPage.goto('http://localhost:3000/brands', { waitUntil: 'domcontentloaded' });
    await tabletPage.waitForTimeout(1200);
    await tabletPage.screenshot({ path: 'public/brand-catalog-tablet.png', fullPage: false });
    console.log('✓ Tablet screenshot: public/brand-catalog-tablet.png');
    await tabletCtx.close();

    // ----------------------------------------------------
    // TEST 3: Mobile Viewport (375x812 - iPhone)
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Mobile (375x812) ---');
    const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto('http://localhost:3000/brands', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1200);
    await mobilePage.screenshot({ path: 'public/brand-catalog-mobile.png', fullPage: false });
    console.log('✓ Mobile screenshot: public/brand-catalog-mobile.png');
    await mobileCtx.close();

    // ----------------------------------------------------
    // TEST 4: Standalone prototype.html file:/// protocol
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Standalone prototype.html ---');
    const protoCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const protoPage = await protoCtx.newPage();
    const protoPath = 'file:///' + path.resolve(__dirname, '../prototype.html').replace(/\\/g, '/');
    await protoPage.goto(protoPath + '#/brands', { waitUntil: 'domcontentloaded' });
    await protoPage.waitForTimeout(1500);

    const protoCards = await protoPage.$$('#brand-products-grid > div');
    console.log(`✓ Standalone prototype.html rendered ${protoCards.length} product cards`);
    if (protoCards.length !== 50) {
      throw new Error(`Expected 50 product cards on standalone prototype, got ${protoCards.length}`);
    }
    await protoPage.screenshot({ path: 'public/brand-catalog-prototype-standalone.png', fullPage: false });
    console.log('✓ Standalone Prototype screenshot: public/brand-catalog-prototype-standalone.png');
    await protoCtx.close();

    console.log('\n🎉 ALL VERIFICATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
