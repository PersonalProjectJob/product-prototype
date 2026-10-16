import fs from 'fs';
import path from 'path';

const ZENROWS_KEY = 'e14b540b08a70f4ac1f9b723df50ad3507a33fc2';
const JSON_PATH = path.resolve('src/data/crawled_watches.json');
const CSV_PATH = path.resolve('public/clonewatches_master_catalog.csv');

const rawProducts = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
console.log(`Loaded ${rawProducts.length} total products from catalog.`);

// Command line args: node scripts/crawl-zenrows-batch.mjs [limit] [startOffset]
const limit = parseInt(process.argv[2], 10) || 10;
const startOffset = parseInt(process.argv[3], 10) || 0;

console.log(`Batch parameters: Starting at offset ${startOffset}, processing up to ${limit} products with ZenRows.`);

function parseProductPage(html) {
  // Extract Description Inner HTML
  const descMatch = html.match(/<div class="description-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
  const rawDescriptionHtml = descMatch ? descMatch[1].trim() : '';

  // Extract High-Res CDN Images
  const imgRegex = /data-src="(https:\/\/cdn\.moncontentcdn\.com\/uploader\/[a-zA-Z0-9_-]+\.(?:jpg|png|webp|jpeg))"/g;
  const images = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    if (!images.includes(m[1])) {
      images.push(m[1]);
    }
  }

  // Extract Vimeo Video
  const videoMatch = html.match(/src="https:\/\/player\.vimeo\.com\/video\/([0-9]+)/);
  const vimeoId = videoMatch ? videoMatch[1] : null;

  return {
    rawDescriptionHtml,
    images,
    vimeoId
  };
}

async function fetchWithZenRows(targetUrl) {
  const zenrowsEndpoint = `https://api.zenrows.com/v1/?apikey=${ZENROWS_KEY}&url=${encodeURIComponent(targetUrl)}&js_render=true&premium_proxy=true`;
  const res = await fetch(zenrowsEndpoint);
  if (!res.ok) {
    throw new Error(`ZenRows HTTP ${res.status}: ${await res.text()}`);
  }
  return await res.text();
}

function saveCatalog(productsList) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(productsList, null, 2), 'utf-8');

  // Also update CSV
  const headers = [
    'ID', 'Brand', 'Collection', 'Product Name',
    'Variant 1 Name', 'Variant 1 Price (USD)',
    'Variant 2 Name', 'Variant 2 Price (USD)',
    'Primary Image', 'Gallery Images',
    'Movement', 'Case Size', 'Material', 'Water Resistance',
    'Description', 'Status', 'Stock'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [headers.map(h => `"${h}"`).join(',')];
  for (const p of productsList) {
    const row = [
      escapeCsv(p.id),
      escapeCsv(p.brand),
      escapeCsv(p.collection),
      escapeCsv(p.name),
      escapeCsv(p.variant1Name || 'Swiss Movement'),
      escapeCsv(p.variant1Price || 700),
      escapeCsv(p.variant2Name || 'VS / Clean 1:1 Super Clone'),
      escapeCsv(p.variant2Price || 1199),
      escapeCsv(p.primaryImage),
      escapeCsv(Array.isArray(p.images) ? p.images.join(', ') : p.galleryImages),
      escapeCsv(p.movement),
      escapeCsv(p.caseSize),
      escapeCsv(p.material),
      escapeCsv(p.waterResistance),
      escapeCsv(p.description),
      escapeCsv(p.status || 'ACTIVE'),
      escapeCsv(p.stock || 'IN_STOCK')
    ];
    csvRows.push(row.join(','));
  }

  const BOM = '\uFEFF';
  fs.writeFileSync(CSV_PATH, BOM + csvRows.join('\r\n'), 'utf-8');
}

async function run() {
  const targetBatch = rawProducts.slice(startOffset, startOffset + limit);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetBatch.length; i++) {
    const p = targetBatch[i];
    const currentIndex = startOffset + i + 1;
    console.log(`[${currentIndex}/${rawProducts.length}] Processing: ${p.name} ...`);

    if (!p.originalUrl) {
      console.log(` - Skipped (no originalUrl)`);
      continue;
    }

    try {
      const html = await fetchWithZenRows(p.originalUrl);
      const parsed = parseProductPage(html);

      if (parsed.images && parsed.images.length > 0) {
        p.primaryImage = parsed.images[0];
        p.images = parsed.images;
        p.galleryImages = parsed.images.join(', ');
        console.log(`  + Extracted ${parsed.images.length} 4K CDN images!`);
      }

      if (parsed.rawDescriptionHtml && parsed.rawDescriptionHtml.length > 100) {
        p.rawDescriptionHtml = parsed.rawDescriptionHtml;
        console.log(`  + Extracted full Description HTML (${parsed.rawDescriptionHtml.length} bytes)!`);
      }

      if (parsed.vimeoId) {
        p.qcVideoVimeoId = parsed.vimeoId;
        p.qcVideoUrl = `https://player.vimeo.com/video/${parsed.vimeoId}`;
        console.log(`  + Extracted QC Video: ${p.qcVideoUrl}`);
      }

      successCount++;
      // Save progress incrementally
      saveCatalog(rawProducts);
      console.log(`  ✓ Saved product successfully.\n`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}\n`);
      failCount++;
    }

    // Small delay between requests to be gentle
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`=== BATCH COMPLETE ===`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
}

run().catch(console.error);
