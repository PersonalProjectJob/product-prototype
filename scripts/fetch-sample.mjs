async function testFetch() {
  const url = 'https://benthanhluxury.com/index-all-brands/seamaster-diver-300m';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Length:', text.length);
  // Look for text fragments
  const match = text.match(/<div id="main">([\s\S]*?)<\/div>/i);
  if (match) {
    console.log('Main length:', match[1].length);
    console.log('Main preview:', match[1].slice(0, 1000));
  } else {
    console.log('No div#main found');
  }
}
testFetch();
