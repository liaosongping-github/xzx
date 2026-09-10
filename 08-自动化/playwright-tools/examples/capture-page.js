/**
 * 捕获网页信息示例：标题、URL、正文摘要、截图。
 * 用法：
 *   node examples/capture-page.js
 *   node examples/capture-page.js https://example.com
 *   node examples/capture-page.js https://example.com --headed
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--headed');
  const headed = process.argv.includes('--headed');
  const url = args[0] || 'https://example.com';

  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const title = await page.title();
  const finalUrl = page.url();
  const text = await page.locator('body').innerText();
  const summary = text.replace(/\s+/g, ' ').trim().slice(0, 500);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(outDir, `screenshot-${stamp}.png`);
  const jsonPath = path.join(outDir, `capture-${stamp}.json`);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  const payload = {
    url: finalUrl,
    title,
    summary,
    screenshot: screenshotPath,
    capturedAt: new Date().toISOString(),
  };
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(JSON.stringify(payload, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
