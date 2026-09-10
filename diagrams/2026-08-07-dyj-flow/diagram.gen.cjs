const fs = require('fs');

const V_GAP = 40;
const H_GAP = 56;
const BAND_GAP = 24;
const LABEL_W = 52;
const NODE_W = 176;

const COLORS = {
  blue: { fill: '#E1EAFA', border: '#4E83FD', text: '#4E83FD' },
  purple: { fill: '#EAE6F3', border: '#8569CB', text: '#8569CB' },
  green: { fill: '#E3F9E9', border: '#34C724', text: '#34C724' },
  orange: { fill: '#FFF7E6', border: '#FF8800', text: '#FF8800' },
  cyan: { fill: '#E8FFFB', border: '#14C0FF', text: '#14C0FF' },
  pink: { fill: '#FEEEED', border: '#F54A45', text: '#F54A45' },
};

function vLabel(text) {
  return text.replace(/(.)/g, '$1\n').trim();
}

function rect(id, text, theme = COLORS.blue) {
  return {
    type: 'rect',
    id,
    width: NODE_W,
    height: 'fit-content',
    fillColor: theme.fill,
    borderColor: theme.border,
    borderWidth: 2,
    borderRadius: 8,
    text,
    fontSize: 12,
    textColor: '#1F2329',
    textAlign: 'center',
    verticalAlign: 'middle',
  };
}

function pill(id, text) {
  return {
    type: 'rect',
    id,
    width: NODE_W,
    height: 'fit-content',
    fillColor: '#F5F6F7',
    borderColor: '#BBBFC4',
    borderWidth: 2,
    borderRadius: 20,
    text,
    fontSize: 13,
    textColor: '#1F2329',
    textAlign: 'center',
    verticalAlign: 'middle',
  };
}

function decision(id, text) {
  return {
    type: 'diamond',
    id,
    width: 120,
    height: 'fit-content',
    fillColor: '#FFF7E6',
    borderColor: '#FF8800',
    borderWidth: 2,
    text,
    fontSize: 12,
    textColor: '#1F2329',
    textAlign: 'center',
    verticalAlign: 'middle',
  };
}

/**
 * 纯布局 frame：禁止 fill / border / padding，避免 whiteboard-cli → 飞书 OpenAPI
 * 编译为带默认填充的大 composite_shape 并盖住流程节点。
 */
function hRow(children, gap = H_GAP) {
  return {
    type: 'frame',
    layout: 'horizontal',
    gap,
    padding: 0,
    width: 'fit-content',
    height: 'fit-content',
    alignItems: 'start',
    children,
  };
}

function vCol(children, gap = V_GAP) {
  return {
    type: 'frame',
    layout: 'vertical',
    gap,
    padding: 0,
    width: 'fit-content',
    height: 'fit-content',
    alignItems: 'center',
    children,
  };
}

function moduleBand(label, theme, bodyChildren) {
  return hRow([
    {
      type: 'text',
      text: vLabel(label),
      width: LABEL_W,
      height: 'fit-content',
      textAlign: 'center',
      verticalAlign: 'middle',
      fontSize: 16,
      fontWeight: 'bold',
      textColor: theme.text,
    },
    vCol(bodyChildren),
  ], 16);
}

function conn(from, to, label, opts = {}) {
  const c = {
    from,
    to,
    lineShape: opts.lineShape || 'rightAngle',
    lineColor: '#BBBFC4',
    lineWidth: 2,
    endArrow: 'arrow',
  };
  if (label) {
    c.label = label;
    c.labelFillColor = '#FFFFFF';
  }
  if (opts.fromAnchor) c.fromAnchor = opts.fromAnchor;
  if (opts.toAnchor) c.toAnchor = opts.toAnchor;
  return { type: 'connector', connector: c };
}

const bands = [
  moduleBand('基础数据管理', COLORS.blue, [
    pill('start', '开始'),
    rect('org', '组织架构'),
    rect('role', '员工+角色\n权限'),
    rect('import', '导入/手填\n资料'),
    rect('cust', '客户资料'),
    rect('vendor', '厂商资料'),
    rect('product', '产品资料'),
    rect('wh-info', '仓库信息\n维护'),
    rect('wh-bind', '产品绑定\n库位'),
  ]),
  moduleBand('销售订货', COLORS.purple, [
    rect('xzx', '小竹熊选品\n(可选入口)', COLORS.purple),
    rect('link', '生成链接', COLORS.purple),
    rect('quote', '创建销售\n「报价」单\n(可选)', COLORS.purple),
    rect('offline', '线下报价\n线下确认', COLORS.purple),
    rect('confirm', '客户确认', COLORS.purple),
    hRow([
      vCol([rect('order', '创建销售\n「订货」单', COLORS.purple)]),
      vCol([rect('manual-so', '手动新增\n销售单', COLORS.purple)]),
    ]),
    decision('prepay-q', '是否\n预付款'),
    hRow([
      vCol([rect('pre-receipt', '下发\n「预收单」', COLORS.purple)]),
      vCol([rect('prepay-skip', '跳过预收', COLORS.purple)]),
    ]),
    decision('to-po-q', '是否\n转采购'),
    hRow([
      vCol([rect('issue-po', '下发\n「采购单」', COLORS.purple)]),
      vCol([
        rect('issue-so', '下发\n销售单', COLORS.purple),
        rect('direct-ship', '不转采购\n直发入口', COLORS.purple),
      ]),
    ]),
  ]),
  moduleBand('采购订货', COLORS.green, [
    hRow([
      vCol([rect('create-po', '创建\n采购订货单', COLORS.green)]),
      vCol([
        rect('stock-up', '主动采购\n备货', COLORS.green),
        rect('manual-po', '手动创建\n采购单', COLORS.green),
      ]),
    ]),
    rect('start-po', '开始采购\n(可审批)', COLORS.green),
    rect('smart-send', '智能发单\n通知厂商', COLORS.green),
    rect('vendor-ack', '厂商确认\n操作领单', COLORS.green),
    rect('po-done', '采购完成', COLORS.green),
    rect('vendor-prepay', '可选：下发\n「预付款单」', COLORS.green),
  ]),
  moduleBand('仓库管理', COLORS.orange, [
    hRow([
      vCol([
        rect('recv-order', '基于采购单\n下发「收货单」', COLORS.orange),
        rect('receiving', '收货\n(可部分)', COLORS.orange),
        rect('inbound', '基于收货单\n下发「入库单」', COLORS.orange),
        rect('add-stock', '完成入库\n增加库存', COLORS.orange),
      ]),
      vCol([rect('skip-recv', '手动结单\n(跳过收货)', COLORS.orange)]),
    ]),
    rect('ship-plan', '排柜+发货', COLORS.orange),
    rect('ship-order', '基于销售单\n下发「发货单」', COLORS.orange),
    rect('stock-check', '库存数\n≥出库数', COLORS.orange),
    rect('outbound', '基于发货单\n下发「出库单」', COLORS.orange),
    rect('reduce-stock', '完成出库\n减少库存', COLORS.orange),
  ]),
  hRow([
    moduleBand('销售结算', COLORS.cyan, [
      rect('ar-order', '基于发货单\n下发「应收单」', COLORS.cyan),
      rect('cust-pay', '客户向公司\n付款', COLORS.cyan),
      rect('recv-bill', '创建\n「收款单」', COLORS.cyan),
      rect('writeoff-ar', '关联应收单\n核销金额', COLORS.cyan),
      rect('ar-settle', '生成\n应收结算单', COLORS.cyan),
      pill('end-ar', 'END'),
    ]),
    moduleBand('采购结算', COLORS.pink, [
      rect('ap-order', '基于收货单\n下发「应付单」', COLORS.pink),
      rect('apply-pay', '申请付款', COLORS.pink),
      rect('corp-pay', '公司向厂商\n付款', COLORS.pink),
      rect('writeoff-ap', '关联应付单\n核销金额', COLORS.pink),
      rect('ap-settle', '生成\n应付结算单', COLORS.pink),
      pill('end-ap', 'END'),
    ]),
  ], 48),
];

const connectors = [
  conn('start', 'org'),
  conn('org', 'role'),
  conn('role', 'import'),
  conn('import', 'cust'),
  conn('cust', 'vendor'),
  conn('vendor', 'product'),
  conn('product', 'wh-info'),
  conn('wh-info', 'wh-bind'),
  conn('wh-bind', 'xzx', '就绪', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('xzx', 'link'),
  conn('link', 'quote'),
  conn('quote', 'offline'),
  conn('offline', 'confirm'),
  conn('confirm', 'order'),
  conn('manual-so', 'order', '或', { fromAnchor: 'left', toAnchor: 'right' }),
  conn('order', 'prepay-q'),
  conn('prepay-q', 'pre-receipt', '预付'),
  conn('prepay-q', 'prepay-skip', '不预付'),
  conn('pre-receipt', 'to-po-q'),
  conn('prepay-skip', 'to-po-q'),
  conn('to-po-q', 'issue-po', '转'),
  conn('to-po-q', 'issue-so', '不转/有库存'),
  conn('issue-po', 'create-po', '按供应商\n拆单', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('stock-up', 'manual-po'),
  conn('manual-po', 'create-po', '或', { fromAnchor: 'left', toAnchor: 'right' }),
  conn('create-po', 'start-po'),
  conn('start-po', 'smart-send'),
  conn('smart-send', 'vendor-ack'),
  conn('vendor-ack', 'po-done'),
  conn('po-done', 'vendor-prepay', '可选'),
  conn('po-done', 'recv-order', '生成收货', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('po-done', 'skip-recv', '手动结单', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('recv-order', 'receiving'),
  conn('receiving', 'inbound'),
  conn('inbound', 'add-stock'),
  conn('add-stock', 'ship-plan'),
  conn('skip-recv', 'ship-plan', '直发', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('issue-so', 'direct-ship'),
  conn('direct-ship', 'ship-plan', '直发', { fromAnchor: 'bottom', toAnchor: 'right' }),
  conn('ship-plan', 'ship-order'),
  conn('ship-order', 'stock-check'),
  conn('stock-check', 'outbound', '满足'),
  conn('outbound', 'reduce-stock'),
  conn('reduce-stock', 'ar-order', '发货完成', { fromAnchor: 'bottom', toAnchor: 'top' }),
  conn('ar-order', 'cust-pay'),
  conn('cust-pay', 'recv-bill'),
  conn('recv-bill', 'writeoff-ar'),
  conn('writeoff-ar', 'ar-settle'),
  conn('ar-settle', 'end-ar'),
  conn('add-stock', 'ap-order', '触发应付', { fromAnchor: 'left', toAnchor: 'top' }),
  conn('ap-order', 'apply-pay'),
  conn('apply-pay', 'corp-pay'),
  conn('corp-pay', 'writeoff-ap'),
  conn('writeoff-ap', 'ap-settle'),
  conn('ap-settle', 'end-ap'),
];

const doc = {
  version: 2,
  nodes: [
    {
      type: 'text',
      id: 'doc-title',
      text: '双引鲸客户端主流程（Agent 修正版 v2.2 · 待验证）',
      x: 36,
      y: 20,
      width: 760,
      height: 'fit-content',
      fontSize: 18,
      fontWeight: 'bold',
      textColor: '#1F2329',
      textAlign: 'left',
    },
    {
      type: 'text',
      id: 'doc-note',
      text: '垂直泳道 · 模块纵向叠放 · 流程自上而下；依据 RAW-20260806-001 候选规则，非正式口径',
      x: 36,
      y: 48,
      width: 920,
      height: 'fit-content',
      fontSize: 11,
      textColor: '#8F959E',
      textAlign: 'left',
    },
    {
      type: 'frame',
      layout: 'vertical',
      gap: BAND_GAP,
      padding: 0,
      width: 'fit-content',
      height: 'fit-content',
      x: 36,
      y: 76,
      children: bands,
    },
    ...connectors,
  ],
};

fs.writeFileSync(__dirname + '/diagram.json', JSON.stringify(doc, null, 2));
console.log('written', __dirname + '/diagram.json');
