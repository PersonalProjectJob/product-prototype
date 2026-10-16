import fs from 'fs';

const contentPath = 'C:\\Users\\AD\\.gemini\\antigravity\\brain\\61b4590b-fbae-4575-9b7e-8d4a92b64f6b\\.system_generated\\steps\\1705\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

// Find all framer script links
const matches = [...html.matchAll(/https:\/\/framerusercontent\.com\/[^"'\s]+/g)].map(m => m[0]);
console.log('Unique Framer URLs count:', new Set(matches).size);
const mjs = matches.filter(u => u.endsWith('.mjs'));
console.log('Framer MJS modules:', mjs);

// Find any JSON data or text
const jsonScripts = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
console.log('JSON scripts found:', jsonScripts.length);
jsonScripts.forEach((j, i) => console.log(`JSON #${i}:`, j.slice(0, 200)));

// Search for watch name, price, specs
const searchTerms = ['Seamaster', 'Diver', '300M', 'Omega', 'USD', 'price', 'Variant', 'Clean', 'VSF'];
searchTerms.forEach(term => {
  const count = (html.match(new RegExp(term, 'gi')) || []).length;
  console.log(`Term "${term}": ${count} occurrences`);
});
