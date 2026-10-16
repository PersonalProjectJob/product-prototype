import fs from 'fs';

const ZENROWS_KEY = 'e14b540b08a70f4ac1f9b723df50ad3507a33fc2';
const targetUrl = 'https://www.vsfwatch.cc/collections/rolex/products/rolex-super-clone-watches-11-bruce-wayne-gmt-master-ii-m126710grnr-jubilee-3285-movement';

async function inspectHtml() {
  const zenrowsEndpoint = `https://api.zenrows.com/v1/?apikey=${ZENROWS_KEY}&url=${encodeURIComponent(targetUrl)}&js_render=true&premium_proxy=true`;
  const res = await fetch(zenrowsEndpoint);
  const html = await res.text();
  fs.writeFileSync('scripts/sample_page.html', html, 'utf-8');
  console.log(`Saved sample_page.html (${html.length} bytes)`);

  // Search for description keywords in the saved file
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Bruce Wayne') || line.includes('DD3285') || line.includes('Technical Specifications') || line.includes('Cerachrom') || line.includes('Description')) {
      console.log(`Line ${i+1}: ${line.trim().slice(0, 150)}`);
    }
  }
}

inspectHtml().catch(console.error);
