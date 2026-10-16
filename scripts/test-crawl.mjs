import fs from 'fs';

async function checkCollections() {
  const collections = ['rolex', 'omega', 'patek-philippe', 'audemars-piguet'];
  for (const c of collections) {
    try {
      const res = await fetch(`https://www.vsfwatch.cc/collections/${c}`);
      const html = await res.text();
      const productRegex = /href=["'](\/products\/[^"']+)["']/g;
      const matches = [];
      let m;
      while ((m = productRegex.exec(html)) !== null) {
        matches.push(m[1].split('?')[0]);
      }
      const unique = [...new Set(matches)];
      console.log(`Collection ${c}: ${unique.length} products`);
      if (unique.length > 0) {
        console.log(`  Sample: ${unique[0]}`);
      }
    } catch (e) {
      console.error(c, e.message);
    }
  }
}

checkCollections();
