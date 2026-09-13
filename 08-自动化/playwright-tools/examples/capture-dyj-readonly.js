/**
 * 双引鲸只读采集：打开登录页，等待人工登录后采集产品资料页面。
 * 不填充、不保存账号密码；不执行任何写操作。
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function isSafeStateName(stateName) {
  return /^[a-z0-9-]+$/.test(stateName);
}

function createCaptureNames(stateName, stamp) {
  const base = `dyj-product-information-${stateName}-${stamp}`;
  return { screenshot: `${base}.png`, capture: `${base}.json` };
}

function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });
}

async function main() {
  const stateName = process.argv[2] ?? 'default-single-product';
  const manualCapture = process.argv.includes('--manual');
  if (!isSafeStateName(stateName)) throw new Error('非法证据状态名');

  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('https://trade.tsbsoft.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('请在打开的浏览器中人工登录；脚本只等待产品资料路由，不会填写或保存凭据。');

  await page.waitForURL(/\/(tsHome|tsProductInformation)/, { timeout: 300000 });

  // 登录完成后才开启：避免拦截登录本身的 POST，同时阻止后续任何写请求。
  await page.route('**/*', async (route) => {
    const method = route.request().method();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) return route.abort();
    return route.continue();
  });
  if (!/\/tsProductInformation/.test(page.url())) {
    await page.goto('https://trade.tsbsoft.com/tsProductInformation', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  if (manualCapture) {
    console.log(`已进入只读模式。请人工打开“${stateName}”对应的页面状态；完成后在本终端按 Enter 保存证据。`);
    await waitForEnter();
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const names = createCaptureNames(stateName, stamp);
  const screenshot = path.join(outDir, names.screenshot);
  const capture = path.join(outDir, names.capture);
  const payload = {
    stateName,
    url: page.url(),
    title: await page.title(),
    text: (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim().slice(0, 12000),
    capturedAt: new Date().toISOString(),
    screenshot
  };
  await page.screenshot({ path: screenshot, fullPage: true });
  fs.writeFileSync(capture, JSON.stringify(payload, null, 2), 'utf8');
  console.log(JSON.stringify({ capture, screenshot, url: payload.url }, null, 2));
  await browser.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { createCaptureNames, isSafeStateName };
