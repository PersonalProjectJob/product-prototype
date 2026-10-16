import fs from 'fs';

const html = fs.readFileSync('sample_product.html', 'utf-8');

// Match all base64 strings in _BBDBZAD_
const b64Regex = /"([A-Za-z0-9+/=]{100,})"/g;
let m;
let count = 0;
while ((m = b64Regex.exec(html)) !== null) {
  try {
    const raw = Buffer.from(m[1], 'base64').toString('utf-8');
    const decoded = decodeURIComponent(raw);
    if (decoded.includes('Superocean') || decoded.includes('variant') || decoded.includes('sku') || decoded.includes('price')) {
      console.log(`Found chunk with keywords (len ${decoded.length})`);
      fs.writeFileSync(`decoded_chunk_${count}.json`, decoded);
      count++;
    }
  } catch (e) {
    // ignore
  }
}

console.log('Total decoded chunks matching keywords:', count);
