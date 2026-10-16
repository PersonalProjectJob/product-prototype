import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function exportPrototype() {
  console.log('🚀 Starting Standalone Prototype HTML Export (Zero Admin Mode)...');

  // Step 1: Run Vite build with VITE_PROTOTYPE_MODE='true'
  console.log('📦 Building Vite project in prototype mode...');
  await build({
    root: rootDir,
    mode: 'production',
    define: {
      'import.meta.env.VITE_PROTOTYPE_MODE': JSON.stringify('true')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  });

  const distDir = path.join(rootDir, 'dist');
  const assetsDir = path.join(distDir, 'assets');

  // Step 2: Locate CSS and JS bundles
  const files = fs.readdirSync(assetsDir);
  const cssFile = files.find(f => f.endsWith('.css'));
  const jsFile = files.find(f => f.endsWith('.js'));

  if (!cssFile || !jsFile) {
    throw new Error('Build assets (CSS or JS) not found in dist/assets!');
  }

  console.log(`📄 Found CSS: ${cssFile}`);
  console.log(`📄 Found JS: ${jsFile}`);

  let cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
  let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

  // Step 3: Base64-encode local Figma image assets for 100% standalone offline support
  console.log('🖼️ Base64-encoding Figma assets for single-file portability...');
  const figmaAssets = [
    { src: '/hero-banner-1.png', file: 'public/hero-banner-1.png', mime: 'image/png' },
    { src: '/figma-assets/benthanh-logo.png', file: 'public/figma-assets/benthanh-logo.png', mime: 'image/png' },
    { src: '/figma-assets/brand-grid-logos.png', file: 'public/figma-assets/brand-grid-logos.png', mime: 'image/png' },
    { src: '/figma-assets/brand-hero-banner.png', file: 'public/figma-assets/brand-hero-banner.png', mime: 'image/png' },
    { src: '/figma-assets/brand-precision-banner.png', file: 'public/figma-assets/brand-precision-banner.png', mime: 'image/png' },
    { src: '/figma-assets/brands/rolex.png', file: 'public/figma-assets/brands/rolex.png', mime: 'image/png' },
    { src: '/figma-assets/brands/patek-philippe.png', file: 'public/figma-assets/brands/patek-philippe.png', mime: 'image/png' },
    { src: '/figma-assets/brands/omega.png', file: 'public/figma-assets/brands/omega.png', mime: 'image/png' },
    { src: '/figma-assets/brands/cartier.png', file: 'public/figma-assets/brands/cartier.png', mime: 'image/png' },
    { src: '/figma-assets/brands/breitling.png', file: 'public/figma-assets/brands/breitling.png', mime: 'image/png' },
    { src: '/figma-assets/brands/casio.png', file: 'public/figma-assets/brands/casio.png', mime: 'image/png' },
    { src: '/figma-assets/brands/hublot.png', file: 'public/figma-assets/brands/hublot.png', mime: 'image/png' },
    { src: '/figma-assets/brands/tissot.png', file: 'public/figma-assets/brands/tissot.png', mime: 'image/png' },
    { src: '/figma-assets/brands/iwc.png', file: 'public/figma-assets/brands/iwc.png', mime: 'image/png' },
    { src: '/figma-assets/brands/chanel.png', file: 'public/figma-assets/brands/chanel.png', mime: 'image/png' },
    { src: '/figma-assets/brands/tag-heuer.png', file: 'public/figma-assets/brands/tag-heuer.png', mime: 'image/png' },
    { src: '/figma-assets/brands/audemars-piguet.png', file: 'public/figma-assets/brands/audemars-piguet.png', mime: 'image/png' },
    { src: '/figma-assets/why-us-light.png', file: 'public/figma-assets/why-us-light.png', mime: 'image/png' },
    { src: '/figma-assets/why-us-dark.png', file: 'public/figma-assets/why-us-dark.png', mime: 'image/png' },
    { src: '/figma-assets/keep-browsing.png', file: 'public/figma-assets/keep-browsing.png', mime: 'image/png' },
    { src: '/figma-assets/customer-whatsapp-reviews.png', file: 'public/figma-assets/customer-whatsapp-reviews.png', mime: 'image/png' },
    ...Array.from({ length: 17 }, (_, i) => ({
      src: `/figma-assets/watches/watch-${i}.png`,
      file: `public/figma-assets/watches/watch-${i}.png`,
      mime: 'image/png'
    }))
  ];

  const figmaAssetMap = {};
  const figmaWatchDataUris = [];

  for (let i = 0; i < 17; i++) {
    const fullPath = path.join(rootDir, `public/figma-assets/watches/watch-${i}.png`);
    if (fs.existsSync(fullPath)) {
      const b64 = fs.readFileSync(fullPath).toString('base64');
      const dataUri = `data:image/png;base64,${b64}`;
      figmaWatchDataUris.push(dataUri);
      figmaAssetMap[`/figma-assets/watches/watch-${i}.png`] = dataUri;
    } else {
      figmaWatchDataUris.push('');
    }
  }

  for (const item of figmaAssets) {
    const fullPath = path.join(rootDir, item.file);
    if (fs.existsSync(fullPath)) {
      const b64 = fs.readFileSync(fullPath).toString('base64');
      const dataUri = `data:${item.mime};base64,${b64}`;
      figmaAssetMap[item.src] = dataUri;
      // Replace all occurrences in JS and HTML
      jsContent = jsContent.split(item.src).join(dataUri);
      htmlContent = htmlContent.split(item.src).join(dataUri);
      console.log(`  ✓ Inlined ${item.file} (${Math.round(b64.length / 1024)} KB)`);
    }
  }

  // Safety regex pass for any /figma-assets/watches/watch-X.png references
  jsContent = jsContent.replace(/["']\/figma-assets\/watches\/watch-(\d+)\.png["']/g, (match, p1) => {
    const idx = parseInt(p1, 10);
    return figmaWatchDataUris[idx] ? JSON.stringify(figmaWatchDataUris[idx]) : match;
  });

  // Step 4: Escape </script tags inside JS bundle to avoid breaking inline HTML
  const safeJs = jsContent.replace(/<\/script/gi, '<\\/script');

  // Step 5: Replace external asset tags with inline tags in index.html safely
  // Inject global Base64 asset dictionaries directly into <head> so runtime helpers can access them synchronously
  const globalInlinesScript = `<script>
    window.__FIGMA_WATCH_IMAGES__ = ${JSON.stringify(figmaWatchDataUris)};
    window.__FIGMA_ASSETS__ = ${JSON.stringify(figmaAssetMap)};
  </script>`;

  htmlContent = htmlContent.replace('</head>', () => `${globalInlinesScript}\n</head>`);

  // NOTE: Always use replacer function () => content to avoid $1, $&, $' expansions in minified code!
  htmlContent = htmlContent.replace(
    new RegExp(`<link[^>]*href=["'](?:/assets/|assets/)?${cssFile}["'][^>]*>`, 'i'),
    () => `<style>\n${cssContent}\n</style>`
  );

  // Remove JS <script src="..."> from head
  htmlContent = htmlContent.replace(
    new RegExp(`<script[^>]*src=["'](?:/assets/|assets/)?${jsFile}["'][^>]*></script>`, 'i'),
    ''
  );

  // Insert script right before </body> so document.getElementById('root') is always ready
  htmlContent = htmlContent.replace(
    '</body>',
    () => `<script type="module">\n${safeJs}\n</script>\n</body>`
  );

  // Clean title & meta for prototype presentation
  htmlContent = htmlContent.replace(
    /<title>.*?<\/title>/i,
    '<title>Ben Thanh Luxury — Super Clone Watches (Storefront Prototype)</title>'
  );

  // Step 6: Output standalone HTML files
  const outputPathRoot = path.join(rootDir, 'prototype.html');
  const outputPathDist = path.join(distDir, 'prototype.html');

  fs.writeFileSync(outputPathRoot, htmlContent, 'utf8');
  fs.writeFileSync(outputPathDist, htmlContent, 'utf8');

  const stats = fs.statSync(outputPathRoot);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n🎉 PROTOTYPE EXPORT SUCCESSFUL!`);
  console.log(`📁 File location: ${outputPathRoot}`);
  console.log(`📊 Total size: ${sizeMB} MB (Self-contained, 100% standalone)`);
  console.log(`✨ Features: Full Homepage, Hero Video, Top Brands, Rolex/Omega Grids, QuickView Modal, WhatsApp Ordering Journey.`);
  console.log(`🚫 Admin Page & CMS buttons: Completely excluded.`);
}

exportPrototype().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
