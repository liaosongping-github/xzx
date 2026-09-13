const test = require('node:test');
const assert = require('node:assert/strict');

const { createCaptureNames, isSafeStateName } = require('./capture-dyj-readonly');

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
