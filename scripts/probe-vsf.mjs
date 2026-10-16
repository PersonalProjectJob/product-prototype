import fs from 'fs';

async function main() {
  try {
    const res = await fetch('https://www.vsfwatch.cc/collections/all');
    const html = await res.text();
    console.log('HTML length:', html.length);
    
    // Check product URLs
    const productUrlRegex = /href=["'](\/products\/[^"']+)["']/g;
    const matches = [];
    let m;
    while ((m = productUrlRegex.exec(html)) !== null) {
      matches.push(m[1]);
    }
    const uniqueUrls = [...new Set(matches)];
    console.log('Unique product URLs found:', uniqueUrls.length);
    console.log('Sample product URLs:', uniqueUrls.slice(0, 10));

    // Also let's inspect the first product page
    if (uniqueUrls.length > 0) {
      const prodUrl = 'https://www.vsfwatch.cc' + uniqueUrls[0];
      console.log('\nFetching sample product:', prodUrl);
      const prodRes = await fetch(prodUrl);
      const prodHtml = await prodRes.text();
      fs.writeFileSync('sample_product.html', prodHtml);
      console.log('Saved sample_product.html, length:', prodHtml.length);
    }
  } catch (err) {
    console.error('Error probing:', err);
  }
}

main();
