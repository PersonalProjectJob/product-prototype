import fs from 'fs';

async function inspectRolex() {
  const url = 'https://www.vsfwatch.cc/collections/rolex/products/rolex-super-clone-watches-11-submariner-126610ln-3235-movement';
  const res = await fetch(url);
  const html = await res.text();

  // Find chunks
  const b64Regex = /"([A-Za-z0-9+/=]{100,})"/g;
  let m;
  while ((m = b64Regex.exec(html)) !== null) {
    try {
      const raw = Buffer.from(m[1], 'base64').toString('utf-8');
      const decoded = decodeURIComponent(raw);
      if (decoded.includes('"product":{')) {
        const data = JSON.parse(decoded);
        const p = data.product;
        console.log('--- PRODUCT FOUND ---');
        console.log('Title:', p.title);
        console.log('SPU:', p.spu);
        console.log('Vendor / Brand:', p.vendor);
        console.log('Options:', JSON.stringify(p.options, null, 2));
        console.log('Variants Count:', p.variants.length);
        console.log('Variants:', JSON.stringify(p.variants.map(v => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compare_at_price: v.compare_at_price,
          option1_title: v.option1_title,
          option1_value_title: v.option1_value_title,
          option2_title: v.option2_title,
          option2_value_title: v.option2_value_title
        })), null, 2));
        console.log('Images Count:', (p.images || []).length);
        console.log('First 2 Images:', (p.images || []).slice(0, 2).map(img => img.src));
        console.log('\n--- DESCRIPTION / SPECS ---');
        console.log((p.body_html || '').slice(0, 800));
        fs.writeFileSync('sample_rolex_product.json', JSON.stringify(p, null, 2));
        break;
      }
    } catch (e) {}
  }
}

inspectRolex();
