/**
 * V1.0.2 数据报表原型共用逻辑 · REQ-20260812-001
 */
(function () {
  const PAGES = {
    quote: { file: "01-报价数据报表.html", title: "报价数据报表", tab: "报价数据报表" },
    sales: { file: "02-销售数据报表.html", title: "销售数据报表", tab: "销售数据报表" },
    purchase: { file: "03-采购数据报表.html", title: "采购数据报表", tab: "采购数据报表" },
    receive: { file: "04-收货数据报表.html", title: "收货数据报表", tab: "收货数据报表" },
    ship: { file: "05-发货数据报表.html", title: "发货数据报表", tab: "发货数据报表" },
    perm: { file: "06-角色权限-数据报表.html", title: "角色管理", tab: "角色管理" },
  };

  function toast(msg, type) {
    let el = document.getElementById("dyj-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "dyj-toast";
      el.className = "dyj-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = "dyj-toast is-show" + (type === "warning" ? " is-warning" : "");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  function statusClass(text) {
    const t = String(text || "");
    if (/完成|已转|已发货/.test(t)) return "is-done";
    if (/中|待/.test(t)) return "is-processing";
    if (/审核/.test(t)) return "is-reviewing";
    if (/草稿/.test(t)) return "is-draft";
    if (/作废/.test(t)) return "is-draft";
    return "";
  }

  function renderSidebar(activeKey) {
    const host = document.getElementById("dyj-sidebar");
    if (!host) return;
    const item = (key, label) => {
      const p = PAGES[key];
      const cls = key === activeKey ? "dyj-menu-item is-active" : "dyj-menu-item";
      return `<li class="${cls}"><a href="./${p.file}" style="color:inherit;text-decoration:none;display:block">${label}</a></li>`;
    };
    host.innerHTML = `
      <div class="dyj-brand">
        <span class="dyj-brand-mark">鲸</span>
        <span>双引鲸</span>
      </div>
      <ul class="dyj-menu">
        <li class="dyj-menu-item">首页</li>
        <li class="dyj-menu-item">小竹熊选品 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">展厅管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">产品管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">厂商管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">客户管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">销售管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">采购管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">跟单管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">仓库管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item">财务管理 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item ${activeKey !== "perm" ? "is-active" : ""}">数据报表 <span class="chevron">▾</span></li>
        <ul class="dyj-menu-sub">
          ${item("quote", "报价数据报表")}
          ${item("sales", "销售数据报表")}
          ${item("purchase", "采购数据报表")}
          ${item("receive", "收货数据报表")}
          ${item("ship", "发货数据报表")}
        </ul>
        <li class="dyj-menu-item">综合设置 <span class="chevron">▸</span></li>
        <li class="dyj-menu-item ${activeKey === "perm" ? "is-active" : ""}">系统管理 <span class="chevron">▾</span></li>
        <ul class="dyj-menu-sub">
          ${item("perm", "角色管理")}
        </ul>
      </ul>
    `;
  }

  function renderHeader(activeKey) {
    const p = PAGES[activeKey] || PAGES.quote;
    const tabs = document.getElementById("dyj-page-tabs");
    if (tabs) {
      tabs.innerHTML = `
        <div class="dyj-page-tab">首页 <span class="close">×</span></div>
        <div class="dyj-page-tab is-active">${p.tab} <span class="close">×</span></div>
      `;
    }
    document.title = `双引鲸 · ${p.title}`;
  }

  function cellHtml(col, row) {
    const val = row[col.key];
    if (col.type === "thumb") {
      return `<span class="dyj-thumb-ph" title="无图"></span>`;
    }
    if (col.type === "docLink") {
      return `<a class="js-doc-link" href="#">${val || ""}</a>`;
    }
    if (col.type === "status") {
      const cls = statusClass(val);
      return `<span class="dyj-status ${cls}">${val || ""}</span>`;
    }
    if (col.type === "amount" || col.type === "num") {
      return `<span class="is-num">${val ?? ""}</span>`;
    }
    if (col.type === "profit") {
      const n = parseFloat(val);
      const cls = n < 0 ? "is-num is-neg" : "is-num";
      return `<span class="${cls}">${val ?? ""}</span>`;
    }
    const text = val == null || val === "" ? "" : String(val);
    return `<span title="${text.replace(/"/g, "&quot;")}">${text}</span>`;
  }

  function visibleColumns(report, hidden) {
    return report.columns.filter((c) => !hidden.has(c.key));
  }

  function renderTable(report, hidden) {
    const vis = visibleColumns(report, hidden);
    const visKeys = new Set(vis.map((c) => c.key));
    const groupCells = report.groups
      .map((g) => {
        const n = g.keys.filter((k) => visKeys.has(k)).length;
        return n ? `<th class="is-group" colspan="${n}">${g.name}</th>` : "";
      })
      .join("");
    const colHeads = vis.map((c) => `<th data-col="${c.key}">${c.label}</th>`).join("");
    const body = report.rows
      .map(
        (row, i) => `<tr>
          <td class="is-sticky is-check"><input type="checkbox"></td>
          <td class="is-sticky is-idx">${i + 1}</td>
          ${vis.map((c) => `<td data-col="${c.key}" class="${c.type === "amount" || c.type === "num" || c.type === "profit" ? "is-num-cell" : ""}">${cellHtml(c, row)}</td>`).join("")}
        </tr>`
      )
      .join("");
    return `
      <div class="table-zone">
        <div class="dyj-table-wrap">
          <table class="dyj-table dyj-table-wide">
            <thead>
              <tr>
                <th class="is-sticky is-check" rowspan="2"><input type="checkbox" id="check-all"></th>
                <th class="is-sticky is-idx" rowspan="2">序号</th>
                ${groupCells}
              </tr>
              <tr>${colHeads}</tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        <div class="state-layer" id="loadingLayer"><span class="loading-spinner"></span><span>数据加载中...</span></div>
        <div class="state-layer" id="emptyLayer">
          <div class="empty-state"><div class="empty-icon"></div><p>暂无符合条件的明细行</p></div>
        </div>
        <div class="state-layer" id="forbiddenLayer">
          <div class="empty-state"><div class="empty-icon"></div><p>暂无该报表查看权限</p><span>请联系管理员开通菜单权限</span></div>
        </div>
      </div>
    `;
  }

  function renderFilters(report) {
    const inputs = report.filters
      .map((f) => {
        if (f.type === "select") {
          return `<select class="dyj-select">${f.options.map((o) => `<option>${o}</option>`).join("")}</select>`;
        }
        return `<input class="dyj-input" placeholder="${f.placeholder}">`;
      })
      .join("");
    const statuses = report.statusOptions
      .map(
        (s) =>
          `<label><input type="checkbox"${s.checked ? " checked" : ""}> ${s.label}</label>`
      )
      .join("");
    return `
      <div class="dyj-filter dyj-filter-rich">
        <div class="dyj-filter-row">${inputs}</div>
        <div class="dyj-filter-row">
          <span class="dyj-filter-label">${report.statusLabel}</span>
          <div class="dyj-status-checks">${statuses}</div>
          <button type="button" class="dyj-btn dyj-btn-primary" id="btn-query">查询</button>
          <button type="button" class="dyj-btn" id="btn-reset">重置</button>
        </div>
      </div>
    `;
  }

  function renderColumnModal(report) {
    const groups = report.groups
      .map((g) => {
        const items = g.keys
          .map((k) => {
            const col = report.columns.find((c) => c.key === k);
            if (!col) return "";
            return `<label class="column-option"><input type="checkbox" checked data-col="${col.key}"> <span>${col.label}</span></label>`;
          })
          .join("");
        return `<div class="column-group"><h4>${g.name}</h4><div class="column-grid">${items}</div></div>`;
      })
      .join("");
    return `
      <div class="dyj-modal-mask" id="modal-columns" hidden>
        <div class="dyj-modal column-dialog">
          <div class="dyj-modal-header">
            <span>字段配置（显隐）</span>
            <button type="button" class="dyj-btn dyj-btn-text" data-close-modal="modal-columns">×</button>
          </div>
          <div class="dyj-modal-body">
            <p class="dyj-note" style="margin-top:0">有页面访问权即可配置；导出列=当前显隐后的列。下列为飞书梳理的全量字段。</p>
            <div class="column-actions">
              <label><input type="checkbox" id="selectAllColumns" checked> 全选</label>
              <button type="button" class="dyj-btn dyj-btn-text" id="restoreColumns">恢复默认（全显）</button>
            </div>
            ${groups}
          </div>
          <div class="dyj-modal-footer">
            <button type="button" class="dyj-btn" data-close-modal="modal-columns">关闭</button>
            <button type="button" class="dyj-btn dyj-btn-primary" id="applyColumns">确定</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderReportPage(report) {
    const host = document.getElementById("dyj-content");
    if (!host) return;
    host.innerHTML = `
      <div class="dyj-proto-banner">
        <span>高保真示意 · 演示数据 · 对照列表模式 E-001 / S-001 · 数据源：${report.source} · 行粒度：产品明细行 · REQ-20260812-001 · V1.0.2</span>
        <select class="dyj-select" id="stateSelect" aria-label="演示页面状态" style="min-width:120px;margin-left:auto">
          <option value="normal">正常态</option>
          <option value="empty">空态</option>
          <option value="loading">加载态</option>
          <option value="forbidden">无权限态</option>
          <option value="noexport">无导出权限</option>
        </select>
      </div>
      <section class="dyj-panel">
        <p class="dyj-note">${report.note} 飞书字段清单无日期列，本版筛选不展示日期。</p>
        ${renderFilters(report)}
        <div class="dyj-toolbar">
          <div class="dyj-toolbar-left">
            <button type="button" class="dyj-btn dyj-btn-primary" id="btn-export-filter">导出筛选结果</button>
            <button type="button" class="dyj-btn" id="btn-export-selected">导出勾选</button>
            <span class="toolbar-count">已选 <strong id="selectedCount">0</strong> 项 · 共 ${report.columns.length} 列</span>
          </div>
          <div class="dyj-toolbar-right">
            <button type="button" class="dyj-icon-btn" title="刷新" id="btn-refresh">⟳</button>
            <button type="button" class="dyj-icon-btn" title="字段配置" id="btn-columns">☰</button>
            <button type="button" class="dyj-icon-btn" title="导出" id="btn-export-icon">↓</button>
          </div>
        </div>
        <div id="tableHost">${renderTable(report, new Set())}</div>
        <div class="dyj-pagination">
          <span>共 ${report.rows.length} 条明细行（演示）</span>
          <div class="pager-main">
            <select class="dyj-select" style="min-width:90px"><option>100 条/页</option><option>50 条/页</option><option>20 条/页</option></select>
            <span class="dyj-page-num is-active">1</span>
            <span>前往</span>
            <input class="dyj-input" style="min-width:48px;width:48px" value="1">
            <span>页</span>
          </div>
        </div>
      </section>
    `;
    document.body.insertAdjacentHTML("beforeend", renderColumnModal(report));
  }

  function setDemoState(state, canExportBtns) {
    const loading = document.getElementById("loadingLayer");
    const empty = document.getElementById("emptyLayer");
    const forbidden = document.getElementById("forbiddenLayer");
    [loading, empty, forbidden].forEach((el) => el && el.classList.remove("is-show"));
    if (state === "loading") loading && loading.classList.add("is-show");
    if (state === "empty") empty && empty.classList.add("is-show");
    if (state === "forbidden") forbidden && forbidden.classList.add("is-show");
    const noExport = state === "noexport";
    canExportBtns.forEach((b) => {
      if (!b) return;
      b.disabled = noExport;
      b.classList.toggle("is-disabled", noExport);
      b.title = noExport ? "无导出权限（演示）" : "";
    });
  }

  function bindReport(report) {
    const hidden = new Set();
    const tableHost = document.getElementById("tableHost");
    const exportBtn = document.getElementById("btn-export-filter");
    const exportSelBtn = document.getElementById("btn-export-selected");
    const exportIcon = document.getElementById("btn-export-icon");
    const exportBtns = [exportBtn, exportSelBtn, exportIcon];

    function refreshSelected() {
      const n = document.querySelectorAll(".dyj-table tbody input[type=checkbox]:checked").length;
      const el = document.getElementById("selectedCount");
      if (el) el.textContent = String(n);
    }

    function bindTableBits() {
      const checkAll = document.getElementById("check-all");
      if (checkAll) {
        checkAll.addEventListener("change", () => {
          document.querySelectorAll(".dyj-table tbody input[type=checkbox]").forEach((c) => {
            c.checked = checkAll.checked;
          });
          refreshSelected();
        });
      }
      document.querySelectorAll(".dyj-table tbody input[type=checkbox]").forEach((c) => {
        c.addEventListener("change", refreshSelected);
      });
      document.querySelectorAll("a.js-doc-link").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          toast(`跳转原单据详情：${a.textContent.trim()}（演示）`);
        });
      });
    }

    function rerenderTable() {
      tableHost.innerHTML = renderTable(report, hidden);
      bindTableBits();
      refreshSelected();
      const sel = document.getElementById("stateSelect");
      setDemoState(sel ? sel.value : "normal", exportBtns);
    }

    document.getElementById("btn-query")?.addEventListener("click", () => toast("已按当前条件查询（演示）"));
    document.getElementById("btn-reset")?.addEventListener("click", () => toast("已重置筛选条件（演示）"));
    document.getElementById("btn-refresh")?.addEventListener("click", () => toast("已刷新（演示）"));
    document.getElementById("btn-columns")?.addEventListener("click", () => {
      const el = document.getElementById("modal-columns");
      if (el) el.hidden = false;
    });
    exportBtn?.addEventListener("click", () => {
      if (exportBtn.disabled) return toast("无导出权限", "warning");
      toast("导出当前筛选结果全部明细行（演示）");
    });
    exportSelBtn?.addEventListener("click", () => {
      if (exportSelBtn.disabled) return toast("无导出权限", "warning");
      const n = document.querySelectorAll(".dyj-table tbody input[type=checkbox]:checked").length;
      if (!n) return toast("请先勾选明细行", "warning");
      toast(`导出已勾选 ${n} 行（演示）`);
    });
    exportIcon?.addEventListener("click", () => exportBtn?.click());

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = document.getElementById(btn.getAttribute("data-close-modal"));
        if (el) el.hidden = true;
      });
    });

    const selectAll = document.getElementById("selectAllColumns");
    selectAll?.addEventListener("change", () => {
      document.querySelectorAll("#modal-columns input[data-col]").forEach((c) => {
        c.checked = selectAll.checked;
      });
    });
    document.getElementById("restoreColumns")?.addEventListener("click", () => {
      document.querySelectorAll("#modal-columns input[data-col]").forEach((c) => {
        c.checked = true;
      });
      if (selectAll) selectAll.checked = true;
    });
    document.getElementById("applyColumns")?.addEventListener("click", () => {
      hidden.clear();
      document.querySelectorAll("#modal-columns input[data-col]").forEach((c) => {
        if (!c.checked) hidden.add(c.getAttribute("data-col"));
      });
      const el = document.getElementById("modal-columns");
      if (el) el.hidden = true;
      rerenderTable();
      toast("已保存字段显隐（演示）");
    });

    document.getElementById("stateSelect")?.addEventListener("change", (e) => {
      setDemoState(e.target.value, exportBtns);
    });

    bindTableBits();
  }

  function boot(activeKey, opts) {
    renderSidebar(activeKey);
    renderHeader(activeKey);
    if (opts && opts.bindReport) {
      const report = window.DYJ_REPORTS[activeKey];
      if (!report) return;
      renderReportPage(report);
      bindReport(report);
    }
  }

  window.DYJ = { boot, toast, PAGES };
})();
