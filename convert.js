const fs = require('fs');
const html = fs.readFileSync('frontend/src/shaders/brand-orbs/sources/brand-orbs-v2.html', 'utf8');
const escaped = html.replace(/`/g, '\\`').replace(/\$/g, '\\$');
fs.writeFileSync('frontend/src/shaders/brand-orbs/sources/brand-orbs-v2.ts', `export default \`${escaped}\`;`);
