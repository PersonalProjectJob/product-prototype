import fs from 'fs';

async function mapSite() {
  const collections = [
    'rolex', 'daytona', 'submariner', 'gmt-master-ii', 'datejust', 'ladies-31mm-datejust',
    'day-date', 'explorer-ll', 'oyster-perpetual', 'sea-dweller', 'yacht-master',
    'air-king', 'milgauss', 'land-dweller', 'sky-dweller', 'patek-philippe',
    'audemars-piguet', 'panerai', 'richard-mille', 'breitling', 'omega',
    'vacheron-constantin', 'hublot', 'iwc', 'franck-muller', 'cartier'
  ];

  const allProductUrls = new Set();

  for (const c of collections) {
    // pagination: page 1, 2, ...
    for (let page = 1; page <= 5; page++) {
      const url = `https://www.vsfwatch.cc/collections/${c}?page=${page}`;
      try {
        const res = await fetch(url);
        const html = await res.text();
        const pRegex = /href=["'](\/products\/[^"']+|\/collections\/[^/]+\/products\/[^"']+)["']/g;
        let count = 0;
        let m;
        while ((m = pRegex.exec(html)) !== null) {
          const cleanUrl = m[1].split('?')[0];
          if (!allProductUrls.has(cleanUrl)) {
            allProductUrls.add(cleanUrl);
            count++;
          }
        }
        if (count === 0 && page > 1) break; // no more products on page
      } catch (e) {
        break;
      }
    }
    console.log(`Scanned collection ${c}, cumulative total unique products: ${allProductUrls.size}`);
  }

  console.log(`\nTOTAL UNIQUE PRODUCTS DISCOVERED: ${allProductUrls.size}`);
  fs.writeFileSync('all_product_urls.json', JSON.stringify([...allProductUrls], null, 2));
}

mapSite();
