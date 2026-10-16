const fs = require('fs');
const path = require('path');

let errors = 0;

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const importRegex = /(?:import|from)\s+['"](\.[^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const dirOfFile = path.dirname(full);
        let resolved = path.resolve(dirOfFile, importPath);
        if (!fs.existsSync(resolved)) {
          if (fs.existsSync(resolved + '.jsx')) { resolved += '.jsx'; }
          else if (fs.existsSync(resolved + '.js')) { resolved += '.js'; }
          else if (fs.existsSync(resolved + '.json')) { resolved += '.json'; }
          else if (fs.existsSync(resolved + '.css')) { resolved += '.css'; }
        }
        if (!fs.existsSync(resolved)) {
          console.error(`❌ MISSING: "${importPath}" imported in "${path.relative('.', full)}"`);
          errors++;
        } else {
          // Check actual casing on disk
          const parts = path.relative(path.resolve('.'), resolved).split(path.sep);
          let curr = path.resolve('.');
          for (const p of parts) {
            const actualEntries = fs.readdirSync(curr);
            if (!actualEntries.includes(p)) {
              const matched = actualEntries.find(e => e.toLowerCase() === p.toLowerCase());
              console.error(`❌ CASING MISMATCH: "${p}" should be "${matched}" in "${importPath}" imported in "${path.relative('.', full)}"`);
              errors++;
            }
            curr = path.join(curr, p);
          }
        }
      }
    }
  }
}

console.log('🔍 Checking case sensitivity across all src/ files for Linux/Vercel compatibility...');
checkDir('src');
if (errors === 0) {
  console.log('✅ 100% of imports match exact disk casing! Linux/Vercel compatible.');
} else {
  console.error(`❌ Found ${errors} casing or missing import errors!`);
  process.exit(1);
}
