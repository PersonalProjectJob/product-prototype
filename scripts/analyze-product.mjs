import fs from 'fs';

const html = fs.readFileSync('sample_product.html', 'utf-8');

// Look for window._BBDBZAD_ or other JSON blobs in script tags
const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Total script tags:', scriptMatches.length);

for (let i = 0; i < scriptMatches.length; i++) {
  const content = scriptMatches[i][1];
  if (content.includes('product') || content.includes('_BBDBZAD_') || content.includes('variants') || content.includes('sku')) {
    console.log(`Script ${i} mentions keywords, length: ${content.length}`);
    if (content.includes('_BBDBZAD_')) {
      console.log('Found _BBDBZAD_ in script', i);
      const m = content.match(/window\._BBDBZAD_\s*=\s*(\[[^\]]+\])/);
      if (m) {
        try {
          const arr = JSON.parse(m[1]);
          console.log('Base64 chunks count:', arr.length);
          for (let j = 0; j < arr.length; j++) {
            const decoded = decodeURIComponent(Buffer.from(arr[j], 'base64').toString('utf-8'));
            console.log(`Chunk ${j} decoded preview:`, decoded.slice(0, 300));
            if (decoded.includes('variant') || decoded.includes('price') || decoded.includes('sku') || decoded.includes('Superocean')) {
              fs.writeFileSync(`chunk_${j}.json`, decoded);
              console.log(`Saved chunk_${j}.json (contains product data!)`);
            }
          }
        } catch (e) {
          console.error('Failed to parse _BBDBZAD_:', e.message);
        }
      }
    }
  }
}
