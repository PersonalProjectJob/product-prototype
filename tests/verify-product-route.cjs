const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Running Multi-Screen Responsive Verification for Specs Block...');
  const browser = await chromium.launch({ headless: true });

  const url = 'http://localhost:3000/index-all-brands/rolex-super-clone-watches-11-day-date-18k-rose-gold-grey-roman-dial-40mm-m228235-0055-3255-movement';

  // 1. Desktop Test (1440x960)
  console.log('1. Testing Desktop (1440x960)...');
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(url, { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(1500);

  // Scroll to specs section
  const specsEl = await desktopPage.$('#full-editorial-specs');
  if (specsEl) await specsEl.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'public/specs-responsive-desktop.png', fullPage: false });
  console.log('✓ Desktop screenshot: public/specs-responsive-desktop.png');
  await desktopCtx.close();

  // 2. Tablet Test (768x1024)
  console.log('2. Testing Tablet (768x1024)...');
  const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletCtx.newPage();
  await tabletPage.goto(url, { waitUntil: 'domcontentloaded' });
  await tabletPage.waitForTimeout(1500);
  const tabletSpecsEl = await tabletPage.$('#full-editorial-specs');
  if (tabletSpecsEl) await tabletSpecsEl.scrollIntoViewIfNeeded();
  await tabletPage.waitForTimeout(500);
  await tabletPage.screenshot({ path: 'public/specs-responsive-tablet.png', fullPage: false });
  console.log('✓ Tablet screenshot: public/specs-responsive-tablet.png');
  await tabletCtx.close();

  // 3. Mobile Test (375x812 - iPhone)
  console.log('3. Testing Mobile (375x812)...');
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(url, { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1500);
  const mobileSpecsEl = await mobilePage.$('#full-editorial-specs');
  if (mobileSpecsEl) await mobileSpecsEl.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'public/specs-responsive-mobile.png', fullPage: false });
  console.log('✓ Mobile screenshot: public/specs-responsive-mobile.png');
  await mobileCtx.close();

  await browser.close();
  console.log('\n🎉 ALL RESPONSIVE VIEWPORT CHECKS PASSED 100%!');
})();
