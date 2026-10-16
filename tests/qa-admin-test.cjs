const fs = require('fs');

const csv = fs.readFileSync('public/clonewatches_master_catalog.csv', 'utf8');
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(',').map(s => s.replace(/^"|"$/g, '').trim());

console.log('--- 22 CSV Canonical Columns vs StoreContext Import Mapping ---');
headers.forEach((h, idx) => {
  console.log(`Index ${idx}: ${h}`);
});

console.log('\n--- StoreContext importCatalogFromCsv Mapping ---');
console.log('row[0] -> ID');
console.log('row[1] -> Brand');
console.log('row[2] -> Collection');
console.log('row[3] -> Name');
console.log('row[4] -> Variant 1 Name (CSV actually has: "' + headers[4] + '") => BUG!');
console.log('row[5] -> Variant 1 Price (CSV actually has: "' + headers[5] + '") => BUG!');
console.log('row[6] -> Variant 2 Name (CSV actually has: "' + headers[6] + '") => BUG!');
console.log('row[7] -> Variant 2 Price (CSV actually has: "' + headers[7] + '") => BUG!');
console.log('row[8] -> Primary Image (CSV actually has: "' + headers[8] + '") => BUG!');
