const fs = require('fs');
['public/commbank.svg', 'public/nab.svg', 'public/westpac.svg'].forEach(f => {
  let c = fs.readFileSync(f, 'utf-8');
  c = c.replace(/<path d="[^"]+"\/>/g, '');
  fs.writeFileSync(f, c);
  console.log(f + ' done');
});
