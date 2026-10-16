import fs from 'fs';

const html = fs.readFileSync('scripts/sample_page.html', 'utf-8');

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

const parsed = parseProductPage(html);
console.log('--- PARSED RESULT ---');
console.log('Images found:', parsed.images.length);
console.log('Sample Image 1:', parsed.images[0]);
console.log('Sample Image 2:', parsed.images[1]);
console.log('Vimeo Video ID:', parsed.vimeoId);
console.log('Description HTML length:', parsed.rawDescriptionHtml.length);
fs.writeFileSync('scripts/sample_description.html', parsed.rawDescriptionHtml, 'utf-8');
console.log('Wrote scripts/sample_description.html successfully');

