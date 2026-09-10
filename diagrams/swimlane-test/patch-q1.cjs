const fs = require('fs');
const path = require('path');

const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'before.json'), 'utf8'));
const table = JSON.parse(JSON.stringify(before.nodes[0]));

table.table.meta.col_sizes = [120, 880];
table.table.meta.row_sizes = [80, 280, 480];
table.width = 1000;
table.height = 840;

const payload = { nodes: [table] };
fs.writeFileSync(path.join(__dirname, 'patch-q1-payload.json'), JSON.stringify(payload, null, 2));
console.log('patched q1:3', table.table.meta.col_sizes, table.table.meta.row_sizes, table.width, table.height);
