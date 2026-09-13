const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assertNoSensitiveData,
  buildMenuInventory,
  createCaptureNames,
  createPageId,
  isSafeStateName,
  parseStateNames
} = require('./capture-dyj-readonly');

test('为默认页面生成含状态名的证据文件名', () => {
  assert.equal(isSafeStateName('default-single-product'), true);
  assert.deepEqual(
    createCaptureNames('default-single-product', '2026-09-13T10-11-44-773Z'),
    {
      screenshot: 'dyj-product-information-default-single-product-2026-09-13T10-11-44-773Z.png',
      capture: 'dyj-product-information-default-single-product-2026-09-13T10-11-44-773Z.json'
    }
  );
});

test('拒绝可能影响输出路径的非法状态名', () => {
  assert.equal(isSafeStateName('../login'), false);
  assert.equal(isSafeStateName('advanced search'), false);
});

test('解析单次登录的多个手工采集状态', () => {
  assert.deepEqual(parseStateNames('advanced-search,column-settings'), ['advanced-search', 'column-settings']);
  assert.throws(() => parseStateNames('advanced-search,../login'), /非法证据状态名/);
});

test('生成含固定采集上下文与稳定 pageId 的菜单目录记录', () => {
  const records = buildMenuInventory({
    capturedAt: '2026-09-14T01:02:03.000Z',
    accountRole: '贸易端测试角色',
    viewport: { width: 1440, height: 900 },
    items: [
      {
        level1Name: '产品管理',
        level2Name: '产品资料',
        route: '/tsProductInformation',
        visible: true
      }
    ]
  });

  assert.deepEqual(records, [
    {
      pageId: 'product/product-information',
      capturedAt: '2026-09-14T01:02:03.000Z',
      accountRole: '贸易端测试角色',
      viewport: { width: 1440, height: 900 },
      level1Name: '产品管理',
      level2Name: '产品资料',
      route: '/tsProductInformation',
      visible: true
    }
  ]);
  assert.equal(createPageId('首页', '/tsHome'), 'home/home');
});

test('拒绝密码、Token 和 Cookie 进入菜单目录', () => {
  const context = {
    capturedAt: '2026-09-14T01:02:03.000Z',
    accountRole: '贸易端测试角色',
    viewport: { width: 1440, height: 900 },
    items: [
      {
        level1Name: '产品管理',
        level2Name: '产品资料',
        route: '/tsProductInformation',
        visible: true
      }
    ]
  };

  assert.throws(() => assertNoSensitiveData({ password: 'not-a-real-password' }), /敏感信息/);
  assert.throws(() => buildMenuInventory({ ...context, accessToken: 'not-a-real-token' }), /敏感信息/);
  assert.throws(() => buildMenuInventory({ ...context, cookie: 'not-a-real-cookie' }), /敏感信息/);
});

test('拒绝重复 pageId，避免同一可见页面重复进入范围分母', () => {
  assert.throws(
    () => buildMenuInventory({
      capturedAt: '2026-09-14T01:02:03.000Z',
      accountRole: '贸易端测试角色',
      viewport: { width: 1440, height: 900 },
      items: [
        { level1Name: '产品管理', level2Name: '产品资料', route: '/tsProductInformation', visible: true },
        { level1Name: '产品管理', level2Name: '产品资料', route: '/tsProductInformation', visible: true }
      ]
    }),
    /重复 pageId/
  );
});
