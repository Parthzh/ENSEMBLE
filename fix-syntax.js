const fs = require('fs');
let data = fs.readFileSync('frontend/src/components/ui/model-deep-dive.tsx', 'utf8');
data = data.replace(/\\`/g, '`');
data = data.replace(/\\\$/g, '$');
fs.writeFileSync('frontend/src/components/ui/model-deep-dive.tsx', data);
