/**
 * 操作网页示例：打开页面、填写搜索框、回车、抓取结果标题。
 * 用法：
 *   node examples/interact-page.js
 *   node examples/interact-page.js "playwright" --headed
 */
const { chromium } = require('playwright');

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--headed');
  const headed = process.argv.includes('--headed');
  const query = args[0] || 'Playwright';

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('https://duckduckgo.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const search = page.locator('input[name="q"]');
  await search.fill(query);
  await search.press('Enter');
  await page.waitForLoadState('domcontentloaded');

  // 尽量等结果区出现；页面改版时可能超时，超时后仍尝试读取
  try {
    await page.waitForSelector('article, [data-testid="result"], h2', {
      timeout: 15000,
    });
  } catch (_) {
    // ignore
  }

  const titles = await page.locator('h2').allTextContents();
  const top = titles.map((t) => t.trim()).filter(Boolean).slice(0, 8);

  console.log(
    JSON.stringify(
      {
        query,
        resultCount: top.length,
        titles: top,
        url: page.url(),
      },
      null,
      2
    )
  );

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
