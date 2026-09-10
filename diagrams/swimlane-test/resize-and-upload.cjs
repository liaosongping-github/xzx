const fs = require('fs');
const path = require('path');

const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'before.json'), 'utf8'));
const nodes = before.nodes || before.data?.nodes || [];

const table = nodes.find((n) => n.type === 'table');
if (!table) {
  console.error('no table node found');
  process.exit(1);
}

const beforeMeta = JSON.parse(JSON.stringify(table.table.meta));

// 明显可辨的尺寸调整（验证用）
table.table.meta.col_sizes = [120, 880];
table.table.meta.row_sizes = [80, 280, 480];

table.width = table.table.meta.col_sizes.reduce((a, b) => a + b, 0);
table.height = table.table.meta.row_sizes.reduce((a, b) => a + b, 0);

const payload = { nodes: [table] };

fs.writeFileSync(path.join(__dirname, 'resize-payload.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(
  path.join(__dirname, 'resize-log.txt'),
  [
    'table id: ' + table.id,
    'before col_sizes: ' + JSON.stringify(beforeMeta.col_sizes),
    'after  col_sizes: ' + JSON.stringify(table.table.meta.col_sizes),
    'before row_sizes: ' + JSON.stringify(beforeMeta.row_sizes),
    'after  row_sizes: ' + JSON.stringify(table.table.meta.row_sizes),
    'before width/height: ' + before.width + ' x ' + before.height,
    'after  width/height: ' + table.width + ' x ' + table.height,
  ].join('\n')
);

console.log(fs.readFileSync(path.join(__dirname, 'resize-log.txt'), 'utf8'));
