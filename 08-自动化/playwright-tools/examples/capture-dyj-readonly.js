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

function parseStateNames(value) {
  const stateNames = value.split(',').filter(Boolean);
  if (!stateNames.length || !stateNames.every(isSafeStateName)) throw new Error('非法证据状态名');
  return stateNames;
}

const LEVEL_1_SLUGS = new Map([
  ['首页', 'home'],
  ['小竹熊选品', 'selection'],
  ['展厅管理', 'showroom'],
  ['产品管理', 'product'],
  ['厂商管理', 'manufacturer'],
  ['客户管理', 'customer'],
  ['销售管理', 'sales'],
  ['采购管理', 'procurement'],
  ['跟单管理', 'order-tracking'],
  ['仓库管理', 'warehouse'],
  ['财务管理', 'finance'],
  ['综合设置', 'settings'],
  ['系统管理', 'system']
]);

function assertNoSensitiveData(value) {
  const visit = (current) => {
    if (typeof current === 'string') {
      if (/bearer\s+\S+|(?:password|token|cookie)\s*[:=]\s*\S+/i.test(current)) {
        throw new Error('菜单目录包含敏感信息');
      }
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, child] of Object.entries(current)) {
      if (/(password|token|cookie)/i.test(key)) throw new Error('菜单目录包含敏感信息');
      visit(child);
    }
  };
  visit(value);
}

function createPageId(level1Name, route) {
  const moduleSlug = LEVEL_1_SLUGS.get(level1Name);
  if (!moduleSlug) throw new Error(`未知一级菜单：${level1Name}`);
  const routeName = route === '/' ? 'home' : route.replace(/^\//, '').replace(/^(ts|th)/, '');
  const pageSlug = routeName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  if (!pageSlug) throw new Error(`无法生成 pageId：${route}`);
  return `${moduleSlug}/${pageSlug}`;
}

function buildMenuInventory({ capturedAt, accountRole, viewport, items, ...extra }) {
  const source = { capturedAt, accountRole, viewport, items, ...extra };
  assertNoSensitiveData(source);
  if (!capturedAt || Number.isNaN(Date.parse(capturedAt))) throw new Error('缺少有效 capturedAt');
  if (!accountRole?.trim()) throw new Error('缺少页面可见账号角色');
  if (!Number.isInteger(viewport?.width) || !Number.isInteger(viewport?.height)) throw new Error('缺少有效 viewport');
  if (!Array.isArray(items)) throw new Error('缺少菜单记录');

  const pageIds = new Set();
  return items.map((item) => {
    assertNoSensitiveData(item);
    if (!item.level1Name?.trim() || !item.level2Name?.trim()) throw new Error('菜单名称不能为空');
    if (!/^\/[a-zA-Z0-9/-]*$/.test(item.route)) throw new Error(`非法菜单路由：${item.route}`);
    if (typeof item.visible !== 'boolean') throw new Error('菜单可见性必须为布尔值');
    const pageId = createPageId(item.level1Name.trim(), item.route);
    if (pageIds.has(pageId)) throw new Error(`重复 pageId：${pageId}`);
    pageIds.add(pageId);
    return {
      pageId,
      capturedAt,
      accountRole: accountRole.trim(),
      viewport: { width: viewport.width, height: viewport.height },
      level1Name: item.level1Name.trim(),
      level2Name: item.level2Name.trim(),
      route: item.route,
      visible: item.visible
    };
  });
}

function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });
}

async function main() {
  const stateNames = parseStateNames(process.argv[2] ?? 'default-single-product');
  const manualCapture = process.argv.includes('--manual');
  const menuCatalog = process.argv.includes('--menu-catalog');
  const accountRoleArg = process.argv.find((argument) => argument.startsWith('--account-role='));
  const accountRole = accountRoleArg?.slice('--account-role='.length).trim();

  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const viewport = menuCatalog ? { width: 1440, height: 900 } : { width: 1920, height: 1080 };
  const page = await browser.newPage({ viewport });
  await page.goto('https://trade.tsbsoft.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('请在打开的浏览器中人工登录；脚本只等待产品资料路由，不会填写或保存凭据。');

  await page.waitForURL(/\/(tsHome|tsProductInformation)/, { timeout: 300000 });

  // 登录完成后才开启：避免拦截登录本身的 POST，同时阻止后续任何写请求。
  await page.route('**/*', async (route) => {
    const method = route.request().method();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) return route.abort();
    return route.continue();
  });
  if (menuCatalog) {
    if (!accountRole) throw new Error('菜单采集必须通过 --account-role=页面可见角色名称 记录账号角色');
    if (!/\/tsHome(?:$|[?#])/.test(page.url())) {
      await page.goto('https://trade.tsbsoft.com/tsHome', { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

    const submenuTitles = page.locator(
      '.el-aside .el-sub-menu__title, .el-aside .el-submenu__title, aside .el-sub-menu__title, aside .el-submenu__title'
    );
    for (let index = 0; index < await submenuTitles.count(); index += 1) {
      const title = submenuTitles.nth(index);
      const parent = title.locator('..');
      if ((await parent.getAttribute('aria-expanded')) === 'false') {
        await title.click();
      }
    }

    const items = await page.evaluate(() => {
      const cleanText = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const normalizeRoute = (item) => {
        const href = item.querySelector('a[href]')?.getAttribute('href');
        const candidate = href || item.getAttribute('index') || item.getAttribute('data-index') || '';
        if (!candidate) return '';
        return new URL(candidate, window.location.origin).pathname;
      };
      const root = document.querySelector('.el-aside > .el-menu, aside > .el-menu, .el-aside .el-menu, aside .el-menu');
      if (!root) throw new Error('未找到左侧菜单');
      const records = [];
      for (const node of root.children) {
        if (node.matches('.el-menu-item')) {
          const name = cleanText(node);
          records.push({ level1Name: name, level2Name: name, route: normalizeRoute(node), visible: true });
          continue;
        }
        if (!node.matches('.el-sub-menu, .el-submenu')) continue;
        const title = node.querySelector(':scope > .el-sub-menu__title, :scope > .el-submenu__title');
        const level1Name = cleanText(title);
        const children = node.querySelectorAll(':scope > .el-menu > .el-menu-item');
        for (const child of children) {
          records.push({
            level1Name,
            level2Name: cleanText(child),
            route: normalizeRoute(child),
            visible: true
          });
        }
      }
      return records;
    });
    const capturedAt = new Date().toISOString();
    const pages = buildMenuInventory({ capturedAt, accountRole, viewport, items });
    const payload = {
      context: {
        capturedAt,
        accountRole,
        browser: 'Chromium (Playwright)',
        zoom: '100%',
        viewport,
        entry: 'https://trade.tsbsoft.com/tsHome'
      },
      pages
    };
    assertNoSensitiveData(payload);
    const stamp = capturedAt.replace(/[:.]/g, '-');
    const capture = path.join(outDir, `dyj-menu-inventory-${stamp}.json`);
    fs.writeFileSync(capture, JSON.stringify(payload, null, 2), 'utf8');
    console.log(JSON.stringify({ capture, pageCount: pages.length }, null, 2));
    await browser.close();
    return;
  }
  if (!/\/tsProductInformation/.test(page.url())) {
    await page.goto('https://trade.tsbsoft.com/tsProductInformation', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  for (const stateName of stateNames) {
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
  }
  await browser.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  assertNoSensitiveData,
  buildMenuInventory,
  createCaptureNames,
  createPageId,
  isSafeStateName,
  parseStateNames
};
