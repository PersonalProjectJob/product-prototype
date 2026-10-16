const ZENROWS_KEY = 'e14b540b08a70f4ac1f9b723df50ad3507a33fc2';
const targetUrl = 'https://www.vsfwatch.cc/collections/rolex/products/rolex-super-clone-watches-11-bruce-wayne-gmt-master-ii-m126710grnr-jubilee-3285-movement';

async function checkZenRowsHeaders() {
  const zenrowsEndpoint = `https://api.zenrows.com/v1/?apikey=${ZENROWS_KEY}&url=${encodeURIComponent(targetUrl)}&js_render=true&premium_proxy=true`;
  const res = await fetch(zenrowsEndpoint);
  console.log('Status:', res.status);
  console.log('ZenRows All Headers:');
  for (const [k, v] of res.headers.entries()) {
    console.log(` ${k}: ${v}`);
  }

}

checkZenRowsHeaders().catch(console.error);
