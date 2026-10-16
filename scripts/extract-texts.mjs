import fs from 'fs';

const html = fs.readFileSync('benthanh_sample.html', 'utf8');

// Find all text blocks
const textMatches = html
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .match(/>([^<]{3,})</g) || [];

const texts = textMatches
  .map(t => t.replace(/[><]/g, '').trim())
  .filter(t => t.length > 0 && !t.startsWith('var ') && !t.startsWith('{'));

fs.writeFileSync('benthanh_texts.txt', texts.join('\n'), 'utf8');
console.log('Saved benthanh_texts.txt, total lines:', texts.length);
console.log('Lines 80 to 180:');
console.log(texts.slice(80, 180));
