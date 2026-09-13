/**
 * 双引鲸只读采集：打开登录页，等待人工登录后采集产品资料页面。
 * 不填充、不保存账号密码；不执行任何写操作。
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('https://trade.tsbsoft.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('请在打开的浏览器中人工登录；脚本只等待产品资料路由，不会填写或保存凭据。');

  await page.waitForURL(/\/(tsHome|tsProductInformation)/, { timeout: 300000 });
  if (!/\/tsProductInformation/.test(page.url())) {
    await page.goto('https://trade.tsbsoft.com/tsProductInformation', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshot = path.join(outDir, `dyj-product-information-${stamp}.png`);
  const capture = path.join(outDir, `dyj-product-information-${stamp}.json`);
  const payload = {
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
