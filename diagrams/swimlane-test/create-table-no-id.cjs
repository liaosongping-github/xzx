const fs = require('fs');
const path = require('path');

const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'before.json'), 'utf8'));
const table = JSON.parse(JSON.stringify(before.nodes[0]));

delete table.id;
table.table.meta.col_sizes = [120, 880];
table.table.meta.row_sizes = [80, 280, 480];
table.width = 1000;
table.height = 840;

fs.writeFileSync(path.join(__dirname, 'create-table-no-id.json'), JSON.stringify({ nodes: [table] }, null, 2));
