import fs from 'fs';

async function findNavCollections() {
  const res = await fetch('https://www.vsfwatch.cc');
  const html = await res.text();
  const colRegex = /href=["'](\/collections\/[^"']+)["']/g;
  const matches = [];
  let m;
  while ((m = colRegex.exec(html)) !== null) {
    matches.push(m[1]);
  }
  const unique = [...new Set(matches)];
  console.log('Unique collections found on homepage:', unique.length);
  console.log(unique);

  // Also check all links on homepage
  const allHref = /href=["']([^"']+)["']/g;
  const allMatches = [];
  while ((m = allHref.exec(html)) !== null) {
    if (m[1].startsWith('/') || m[1].includes('vsfwatch.cc')) {
      allMatches.push(m[1]);
    }
  }
  const uniqueAll = [...new Set(allMatches)];
  console.log('Total internal links on homepage:', uniqueAll.length);
  console.log('Sample links:', uniqueAll.slice(0, 30));
}

findNavCollections();
