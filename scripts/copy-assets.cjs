// Copy node icon(s) into dist after tsc (n8n loads the svg alongside the compiled node).
const { mkdirSync, copyFileSync } = require('node:fs');

const dest = 'dist/nodes/Cognigate';
mkdirSync(dest, { recursive: true });
copyFileSync('nodes/Cognigate/cognigate.svg', `${dest}/cognigate.svg`);
console.log('copied cognigate.svg -> ' + dest);
