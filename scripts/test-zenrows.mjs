import fetch from 'node-fetch';

const ZENROWS_KEY = 'e14b540b08a70f4ac1f9b723df50ad3507a33fc2';
const targetUrl = 'https://www.vsfwatch.cc/collections/rolex/products/rolex-super-clone-watches-11-bruce-wayne-gmt-master-ii-m126710grnr-jubilee-3285-movement';

async function test() {
  console.log('Testing ZenRows connection for Bruce Wayne GMT-Master II...');
  const zenrowsEndpoint = `https://api.zenrows.com/v1/?apikey=${ZENROWS_KEY}&url=${encodeURIComponent(targetUrl)}&js_render=true&premium_proxy=true`;
  
  const startTime = Date.now();
  const res = await fetch(zenrowsEndpoint);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`ZenRows response status: ${res.status} (took ${elapsed}s)`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('ZenRows error:', errorText);
    return;
  }

  const html = await res.text();
  console.log(`Successfully received HTML! Length: ${html.length} bytes`);

  // Search for description content or Base64 chunk
  if (html.includes('Bruce Wayne') || html.includes('Dandong') || html.includes('POWERED BY') || html.includes('Technical Specifications')) {
    console.log('>>> MATCH FOUND! Keywords found in HTML:');
    if (html.includes('POWERED BY')) console.log(' - Found "POWERED BY"');
    if (html.includes('Technical Specifications')) console.log(' - Found "Technical Specifications"');
    if (html.includes('Dandong')) console.log(' - Found "Dandong"');
    if (html.includes('Cerachrom')) console.log(' - Found "Cerachrom"');
  } else {
    console.log('Keywords not immediately matched in plain text, inspecting chunks...');
  }

  // Check Base64 chunks if present
  const b64Regex = /"([A-Za-z0-9+/=]{100,})"/g;
  let m;
  let foundProduct = null;
  while ((m = b64Regex.exec(html)) !== null) {
    try {
      const raw = Buffer.from(m[1], 'base64').toString('utf-8');
      const decoded = decodeURIComponent(raw);
      if (decoded.includes('"product":{')) {
        const data = JSON.parse(decoded);
        if (data.product) {
          foundProduct = data.product;
          break;
        }
      }
    } catch {}
  }

  if (foundProduct) {
    console.log('>>> Successfully extracted Product JSON payload!');
    console.log('Title:', foundProduct.title);
    console.log('Body HTML length:', foundProduct.body_html?.length || 0);
    console.log('Sample Body HTML:', foundProduct.body_html?.slice(0, 300));
  }
}

test().catch(console.error);
