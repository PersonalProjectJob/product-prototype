import fs from 'fs';

async function parsePage() {
  const url = 'https://benthanhluxury.com/index-all-brands/seamaster-diver-300m';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('benthanh_sample.html', html, 'utf8');

  // Strip scripts and styles
  const clean = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Extract visible texts
  const textMatches = clean.match(/>([^<]{2,})</g) || [];
  const texts = textMatches
    .map(t => t.replace(/[><]/g, '').trim())
    .filter(t => t.length > 0 && !t.startsWith('var ') && !t.startsWith('{'));

  console.log('--- EXTRACTED VISIBLE TEXTS (First 80) ---');
  console.log(texts.slice(0, 80));

  console.log('\n--- HEADINGS ---');
  const headings = [...clean.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => `${m[1]}: ${m[2].replace(/<[^>]+>/g, '').trim()}`);
  console.log(headings);

  console.log('\n--- BUTTONS / LINKS ---');
  const buttons = [...clean.matchAll(/<(button|a)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => m[2].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 1 && t.length < 50);
  console.log(Array.from(new Set(buttons)).slice(0, 30));
}

parsePage();
