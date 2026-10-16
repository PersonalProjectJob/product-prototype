const fs = require('fs');
const html = fs.readFileSync('benthanh_sample.html', 'utf8');

const matches = html.match(/data-framer-name="[^"]+"/g) || [];
const unique = [...new Set(matches.map(m => m.replace(/data-framer-name=|"/g, '')))];
console.log(unique.slice(100, 200));
