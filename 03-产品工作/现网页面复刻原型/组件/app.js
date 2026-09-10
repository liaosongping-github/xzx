/* ============================================================
 * 双引鲸贸易端 · 现网页面复刻原型 · 全局壳与通用交互
 * 纯静态、无框架。页面先设置 window.DYJ_ROOT 再引入本文件。
 * ============================================================ */
(function () {
  const ROOT = window.DYJ_ROOT || './';
  const P = {
    home: ROOT + '页面/首页/index.html',
    product: ROOT + '页面/产品管理-产品资料/index.html',
  };

  /* ---------- 现网菜单树（2026-09-10 现网 DOM 实测） ---------- */
  const MENU = [
    { name: '首页', path: P.home, icon: 'home' },
    { name: '小竹熊选品', icon: 'bear', children: [
      { name: '选品中心' }, { name: '选品车' }, { name: '关注厂商' },
    ]},
    { name: '展厅管理', icon: 'hall', children: [
      { name: '择样管理' }, { name: '摊位管理' }, { name: '产品进出展' }, { name: '展厅综合设置' },
    ]},
    { name: '产品管理', icon: 'box', open: true, children: [
      { name: '产品资料', path: P.product },
      { name: '下架产品' }, { name: '物料资料' }, { name: '客户专属' },
      { name: '组合资料' }, { name: '客户产品' },
    ]},
    { name: '厂商管理', icon: 'factory', children: [
      { name: '厂商资料' }, { name: '下架厂商' },
    ]},
    { name: '客户管理', icon: 'user', children: [{ name: '客户资料' }] },
    { name: '销售管理', icon: 'sales', children: [
      { name: '销售报价' }, { name: '销售订货' },
    ]},
    { name: '采购管理', icon: 'purchase', children: [
      { name: '采购订货' }, { name: '物料订货' }, { name: '物料在途' },
      { name: '采购在途' }, { name: '申请付款' },
    ]},
    { name: '跟单管理', icon: 'track', children: [
      { name: '订单跟踪' }, { name: '收货单' }, { name: '排柜计划' }, { name: '客户发货' },
    ]},
    { name: '仓库管理', icon: 'warehouse', children: [
      { name: '产品库位设置' }, { name: '库存查询' }, { name: '采购入库' }, { name: '订单出库' },
    ]},
    { name: '财务管理', icon: 'finance', children: [
      { name: '客户账号' }, { name: '客户收款' }, { name: '客户应收' }, { name: '应收结算' },
      { name: '厂商账号' }, { name: '厂商付款' }, { name: '厂商应付' }, { name: '应付结算' },
    ]},
    { name: '综合设置', icon: 'setting', children: [
      { name: '系统设置' }, { name: '客户设置' }, { name: '产品设置' }, { name: '打印导出模板' },
    ]},
    { name: '系统管理', icon: 'system', children: [
      { name: '用户管理' }, { name: '跟单设置' }, { name: '角色管理' },
      { name: '部门管理' }, { name: '登录日志' }, { name: '操作日志' },
    ]},
    { name: '数据分析', icon: 'chart', children: [
      { name: '报价数据' }, { name: '销售数据' }, { name: '发货数据' },
      { name: '采购数据' }, { name: '收货数据' },
    ]},
  ];

  /* ---------- 极简线性图标（16px，stroke 继承色） ---------- */
  const ICONS = {
    home: '<path d="M2.5 7.5 8 3l5.5 4.5V14a1 1 0 0 1-1 1h-3v-4h-3v4h-3a1 1 0 0 1-1-1z"/>',
    bear: '<circle cx="6" cy="9" r="3"/><circle cx="12.5" cy="9" r="3"/><path d="M3.5 6 2.5 3.5M15 6l1-2.5M8 14.5c1.2 1 3.3 1 4.5 0"/>',
    hall: '<rect x="3" y="5" width="13" height="11" rx="1"/><path d="M3 9h13M8 5V3M3 16h13"/>',
    box: '<path d="M3 7.5 8 4.8l5 2.7 5-2.7v9L13 16.5l-5-2.7-5 2.7z"/><path d="M8 4.8v9l5 2.7M13 7.5v9"/>',
    factory: '<path d="M3 20V10l5 3.5V10l5 3.5V6h5v14z"/><path d="M7 16h.01M11 16h.01M15.5 13h.01M15.5 16.5h.01"/>',
    user: '<circle cx="9" cy="7.5" r="3.2"/><path d="M3.5 18c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/>',
    sales: '<path d="M4 18V8m5 10V5m5 13v-8m5 8V10"/>',
    purchase: '<path d="M3 6h13l-1.5 9H5z"/><path d="M5 6 4 3H2M8.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
    track: '<circle cx="6" cy="17" r="2.2"/><circle cx="15" cy="17" r="2.2"/><path d="M8.2 17H13m-4-6h4l2-4h3"/>',
    warehouse: '<path d="M3 9 8.5 5h7L21 9v9H3z"/><path d="M7 18v-5h10v5M7 11h10"/>',
    finance: '<circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2 17 17M7 9h4M9 7v4"/>',
    setting: '<circle cx="9" cy="9" r="2.6"/><path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M13.6 4.4l-1.4 1.4M5.8 12.2l-1.4 1.4"/>',
    system: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    chart: '<path d="M3 20h14M6 16v-5M11 16V7M16 16v-8"/>',
    search: '<circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/>',
    cart: '<path d="M3 4h2l2.2 10h8.6L18 7H6"/><circle cx="9" cy="17.5" r="1.3"/><circle cx="15" cy="17.5" r="1.3"/>',
    download: '<path d="M9 3v8l-3-3m3 3 3-3M5 15v2.5h10V15"/>',
    collapse: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };
  function icon(name, cls) {
    const body = ICONS[name] || ICONS.box;
    return `<svg class="dyj-svg ${cls || ''}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  /* ---------- 页签（sessionStorage 跨页保持） ---------- */
  const TAB_KEY = 'dyj_tabs_v1';
  function loadTabs() { try { return JSON.parse(sessionStorage.getItem(TAB_KEY)) || [{ name: '首页', path: P.home, home: true }]; } catch { return [{ name: '首页', path: P.home, home: true }]; } }
  function saveTabs(tabs) { sessionStorage.setItem(TAB_KEY, JSON.stringify(tabs)); }
  function ensureTab(tab) {
    const tabs = loadTabs();
    if (!tabs.some(t => t.name === tab.name)) tabs.push(tab);
    saveTabs(tabs);
  }

  function toast(msg, type) {
    let el = document.querySelector('.dyj-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'dyj-toast';
      el.style.cssText = 'position:fixed;top:74px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:6px;font-size:13px;z-index:4000;box-shadow:0 4px 16px rgba(0,0,0,.18);transition:opacity .25s;';
      document.body.appendChild(el);
    }
    if (type === 'warning') {
      el.style.background = '#f56c6c'; el.style.color = '#fff';
    } else {
      el.style.background = 'rgba(40,43,52,.92)'; el.style.color = '#fff';
    }
    el.textContent = msg; el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 1800);
  }

  /* ---------- 渲染全局壳 ---------- */
  function mountShell(opt) {
    const activeName = opt.active; // 当前页面对应菜单名
    // 打开的一级菜单
    MENU.forEach(g => { if (g.children && g.children.some(c => c.name === activeName)) g.open = true; });
    // 登记当前页签
    if (opt.tab) ensureTab(opt.tab);
    const tabs = loadTabs();

    const sidebar = `
      <aside class="sidebar" id="dyjSidebar">
        <div class="sidebar__logo">
          <img src="${ROOT}组件/assets/logo.png" alt="双引鲸"/>
        </div>
        <nav class="sidebar__menu" id="dyjMenu">
          ${MENU.map(g => renderMenuGroup(g, activeName)).join('')}
        </nav>
      </aside>`;

    const header = `
      <header class="top-header">
        <button class="header-collapse" id="dyjCollapse" title="折叠菜单">${icon('collapse')}</button>
        <div class="menu-search" id="dyjMenuSearch">
          <span class="ms-icon">${icon('search')}</span>
          <input id="dyjMenuSearchInput" placeholder="菜单查询" autocomplete="off"/>
          <div class="menu-search__panel" id="dyjMenuSearchPanel"></div>
        </div>
        <div class="header-right">
          <span class="header-weather" id="dyjWeather"></span>
          <span class="header-icon" title="选品车">${icon('cart')}<span class="badge">0</span></span>
          <span class="header-icon" title="导出记录">${icon('download')}</span>
          <span class="header-icon" title="系统设置">${icon('setting')}</span>
          <span class="header-user"><span class="avatar">廖</span>廖送平02
            <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 6 5-6z"/></svg>
          </span>
        </div>
      </header>
      <div class="page-tabs" id="dyjPageTabs">
        ${tabs.map(t => `
          <span class="page-tab ${t.name === activeName ? 'is-active' : ''} ${t.home ? 'is-home' : ''}" data-path="${t.path || ''}" data-name="${t.name}">
            ${t.name}${t.home ? '' : '<span class="pt-close" title="关闭页签">×</span>'}
          </span>`).join('')}
      </div>`;

    const wrapper = document.createElement('div');
    wrapper.className = 'app-wrapper';
    wrapper.innerHTML = sidebar + `<div class="main-container">${header}<main class="app-main" id="dyjMain"></main></div>`;
    // 把页面 #page-content（含页面内全部弹层）整体搬进 main，再用壳替换其位置
    const content = document.getElementById('page-content');
    wrapper.querySelector('#dyjMain').appendChild(content);
    document.body.appendChild(wrapper);
    bindShell();
    renderWeather();
  }

  // 阶段1 未复刻的叶子菜单统一进占位页（保留操作路径，阶段2 替换为真实页面）
  function pathOf(item) { return item.path || `${ROOT}页面/占位页/index.html?n=${encodeURIComponent(item.name)}`; }
  function renderMenuGroup(g, activeName) {
    if (!g.children) {
      return `<a class="menu-item ${g.name === activeName ? 'is-active' : ''}" data-path="${pathOf(g)}" data-name="${g.name}">
        <i class="m-icon">${icon(g.icon)}</i><span class="m-text">${g.name}</span></a>`;
    }
    return `<div class="menu-group ${g.open ? 'is-open' : ''}" data-group="${g.name}">
      <div class="menu-group__title">
        <span class="t-left"><i class="m-icon">${icon(g.icon)}</i><span class="m-text">${g.name}</span></span>
        <span class="menu-group__arrow">▼</span>
      </div>
      <ul class="menu-sub">
        ${g.children.map(c => `<li><a class="menu-item ${c.name === activeName ? 'is-active' : ''}" data-path="${pathOf(c)}" data-name="${c.name}" data-parent="${g.name}"><span class="m-text">${c.name}</span></a></li>`).join('')}
      </ul>
    </div>`;
  }

  function bindShell() {
    // 折叠
    document.getElementById('dyjCollapse').addEventListener('click', () => {
      document.getElementById('dyjSidebar').classList.toggle('is-collapsed');
    });
    // 一级展开/收起
    document.querySelectorAll('.menu-group__title').forEach(t => {
      t.addEventListener('click', () => t.closest('.menu-group').classList.toggle('is-open'));
    });
    // 菜单点击
    document.querySelectorAll('#dyjMenu .menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const p = item.dataset.path;
        if (p) { location.href = p; }
        else { toast(`「${item.dataset.name}」阶段1未复刻`); }
      });
    });
    // 页签点击/关闭
    document.querySelectorAll('#dyjPageTabs .page-tab').forEach(tab => {
      tab.addEventListener('click', e => {
        if (e.target.classList.contains('pt-close')) {
          e.stopPropagation();
          const name = tab.dataset.name;
          let tabs = loadTabs().filter(t => t.name !== name);
          saveTabs(tabs);
          if (tab.classList.contains('is-active')) { location.href = P.home; return; }
          tab.remove();
          return;
        }
        const p = tab.dataset.path;
        if (p && !tab.classList.contains('is-active')) location.href = p;
      });
    });
    // 菜单查询
    const input = document.getElementById('dyjMenuSearchInput');
    const panel = document.getElementById('dyjMenuSearchPanel');
    input.addEventListener('input', () => {
      const kw = input.value.trim();
      if (!kw) { panel.classList.remove('is-show'); panel.innerHTML = ''; return; }
      const hits = [];
      MENU.forEach(g => {
        if (g.children) g.children.forEach(c => { if (c.name.includes(kw)) hits.push({ name: c.name, parent: g.name, path: c.path }); });
        else if (g.name.includes(kw)) hits.push({ name: g.name, parent: '', path: g.path });
      });
      panel.innerHTML = hits.length ? hits.map(h => `<div class="menu-search__item" data-path="${h.path || `${ROOT}页面/占位页/index.html?n=${encodeURIComponent(h.name)}`}" data-name="${h.name}">${h.name}<span class="ms-path">${h.parent}</span></div>`).join('')
        : '<div class="menu-search__item" style="color:#a8abb2;cursor:default">无匹配菜单</div>';
      panel.classList.add('is-show');
      panel.querySelectorAll('.menu-search__item[data-name]').forEach(it => {
        it.addEventListener('click', () => { if (it.dataset.path) location.href = it.dataset.path; });
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#dyjMenuSearch')) panel.classList.remove('is-show');
    });
    // 顶栏图标：现网可点；阶段1 有选品车弹层则打开，其余给演示层/占位页
    document.querySelectorAll('.header-icon').forEach(el => {
      el.addEventListener('click', () => {
        const t = el.getAttribute('title');
        if (t === '选品车') {
          if (document.getElementById('cartDialog')) openDialog('cartDialog');
          else toast('选品车（演示）');
          return;
        }
        if (t === '导出记录') { toast('导出记录（演示空表）'); return; }
        if (t === '系统设置') {
          location.href = `${ROOT}页面/占位页/index.html?n=${encodeURIComponent('系统设置')}`;
        }
      });
    });
  }

  function renderWeather() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const w = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${pad(now.getHours())}:${pad(now.getMinutes())} 深圳：多云`;
    const el = document.getElementById('dyjWeather');
    if (el) el.textContent = w;
  }

  /* ---------- 通用：自定义下拉（el-select 静态版） ---------- */
  // 用法：<div class="el-select" data-options="全部,上架,下架"><div class="el-input__wrapper">…</div></div>
  function bindSelects(root) {
    (root || document).querySelectorAll('.el-select').forEach(sel => {
      if (sel._bound) return; sel._bound = true;
      const options = (sel.dataset.options || '').split(',').map(s => s.trim()).filter(Boolean);
      const input = sel.querySelector('.el-input__inner');
      const dd = document.createElement('div');
      dd.className = 'el-select-dropdown';
      dd.innerHTML = options.map(o => `<div class="el-select-dropdown__item ${o === (input?.value||'') ? 'is-selected' : ''}">${o}</div>`).join('');
      sel.appendChild(dd);
      sel.querySelector('.el-input__wrapper').addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.el-select.is-open').forEach(s => { if (s !== sel) s.classList.remove('is-open'); });
        sel.classList.toggle('is-open');
      });
      dd.querySelectorAll('.el-select-dropdown__item').forEach(it => {
        it.addEventListener('click', () => {
          if (input) input.value = it.textContent.trim();
          dd.querySelectorAll('.el-select-dropdown__item').forEach(x => x.classList.remove('is-selected'));
          it.classList.add('is-selected');
          sel.classList.remove('is-open');
          sel.dispatchEvent(new CustomEvent('change', { detail: it.textContent.trim(), bubbles: true }));
        });
      });
    });
    document.addEventListener('click', () => document.querySelectorAll('.el-select.is-open').forEach(s => s.classList.remove('is-open')));
  }

  /* ---------- 通用：浮层下拉菜单（支持 children 二级） ---------- */
  function openContextMenu(anchor, items, opts) {
    document.querySelectorAll('.el-dropdown-menu.dyj-temp').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'el-dropdown-menu dyj-temp';
    menu.innerHTML = items.map((it, i) => {
      const caret = it.children ? '<span class="dd-caret">›</span>' : '';
      return `<div class="el-dropdown-menu__item ${it.danger ? 'is-danger' : ''}" data-i="${i}">${it.label}${caret}</div>`;
    }).join('');
    document.body.appendChild(menu);
    const r = anchor.getBoundingClientRect();
    const alignRight = opts && opts.align === 'right';
    menu.style.top = (r.bottom + 4) + 'px';
    menu.style.left = Math.max(8, alignRight ? r.right - menu.offsetWidth : r.left) + 'px';

    let subMenu = null;
    function removeAll() {
      if (subMenu) subMenu.remove();
      menu.remove();
      document.removeEventListener('mousedown', onDoc, true);
    }
    function onDoc(e) {
      if (menu.contains(e.target) || (subMenu && subMenu.contains(e.target))) return;
      if (anchor.contains && anchor.contains(e.target)) return;
      removeAll();
    }
    function openSub(el, children) {
      if (subMenu) subMenu.remove();
      subMenu = document.createElement('div');
      subMenu.className = 'el-dropdown-menu dyj-temp';
      subMenu.innerHTML = children.map((c, j) => `<div class="el-dropdown-menu__item" data-j="${j}">${c.label}</div>`).join('');
      document.body.appendChild(subMenu);
      const ir = el.getBoundingClientRect();
      subMenu.style.top = ir.top + 'px';
      subMenu.style.left = (ir.right - 2) + 'px';
      subMenu.querySelectorAll('.el-dropdown-menu__item').forEach((cel, j) => {
        cel.addEventListener('click', ev => {
          ev.preventDefault(); ev.stopPropagation();
          removeAll();
          children[j].onClick && children[j].onClick();
        });
      });
    }
    menu.querySelectorAll('.el-dropdown-menu__item').forEach((el, i) => {
      const it = items[i];
      if (it.children) {
        el.addEventListener('mouseenter', () => openSub(el, it.children));
        el.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); openSub(el, it.children); });
      } else {
        el.addEventListener('mouseenter', () => { if (subMenu) { subMenu.remove(); subMenu = null; } });
        el.addEventListener('click', ev => {
          ev.preventDefault(); ev.stopPropagation();
          removeAll();
          it.onClick && it.onClick();
        });
      }
    });
    setTimeout(() => document.addEventListener('mousedown', onDoc, true), 0);
    return menu;
  }

  /* ---------- 通用：确认框（MessageBox） ---------- */
  function confirmBox(opt) {
    return new Promise(resolve => {
      const mask = document.createElement('div');
      mask.className = 'msgbox-mask is-show';
      mask.innerHTML = `<div class="el-message-box">
        <div class="el-message-box__title">${opt.title || '提示'}</div>
        <div class="el-message-box__content">${opt.content || ''}</div>
        <div class="el-message-box__btns">
          <button class="el-button" data-act="cancel">${opt.cancelText || '取消'}</button>
          <button class="el-button el-button--${opt.type || 'primary'}" data-act="ok">${opt.okText || '确定'}</button>
        </div></div>`;
      document.body.appendChild(mask);
      mask.addEventListener('click', e => {
        if (e.target === mask || e.target.dataset.act) {
          const ok = e.target.dataset.act === 'ok';
          mask.remove(); resolve(ok);
        }
      });
    });
  }

  /* ---------- 通用：弹窗 ---------- */
  function clearInvalidTips() { document.querySelectorAll('.dyj-invalid-tip').forEach(t => t.remove()); }
  function openDialog(id) { const m = document.getElementById(id); if (m) m.classList.add('is-show'); }
  function closeDialog(id) { const m = document.getElementById(id); if (m) { m.classList.remove('is-show'); clearInvalidTips(); } }
  function openDrawer(id) {
    const m = document.getElementById(id + 'Mask'); const d = document.getElementById(id);
    if (m) m.classList.add('is-show'); if (d) d.classList.add('is-show');
  }
  function closeDrawer(id) {
    const m = document.getElementById(id + 'Mask'); const d = document.getElementById(id);
    if (m) m.classList.remove('is-show'); if (d) d.classList.remove('is-show');
    clearInvalidTips();
  }
  function bindClose() {
    document.querySelectorAll('[data-close-dialog]').forEach(b => b.addEventListener('click', () => closeDialog(b.dataset.closeDialog)));
    document.querySelectorAll('[data-close-drawer]').forEach(b => b.addEventListener('click', () => closeDrawer(b.dataset.closeDrawer)));
    document.querySelectorAll('.overlay-mask').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('is-show'); }));
    document.querySelectorAll('.el-drawer-mask').forEach(m => m.addEventListener('click', () => {
      m.classList.remove('is-show');
      const id = m.dataset.for; if (id) closeDrawer(id);
    }));
    if (!window._dyjEscBound) {
      window._dyjEscBound = true;
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.overlay-mask.is-show').forEach(m => m.classList.remove('is-show'));
        document.querySelectorAll('.el-drawer.is-show').forEach(d => closeDrawer(d.id));
        document.querySelectorAll('.msgbox-mask.is-show').forEach(m => m.remove());
      });
    }
  }

  window.DYJ = {
    MENU, P, icon, mountShell, bindSelects, openContextMenu, confirmBox,
    openDialog, closeDialog, openDrawer, closeDrawer, bindClose, toast,
    loadTabs, saveTabs,
  };
})();
