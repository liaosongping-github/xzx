import { useMemo, useState } from "react";
import type { PrototypeRegistry } from "../registry";
import type { ComponentSchema, PageSchema } from "../schema/types";
import { defaultProductFilters, filterProducts, paginateProducts, productTabs, type ProductFilters, type ProductRecord, type ProductTab } from "../mock/product-information";

type Props = { schema: PageSchema; registry: PrototypeRegistry };

function componentByType(schema: PageSchema, registry: PrototypeRegistry, type: string): ComponentSchema | undefined {
  const visit = (component: ComponentSchema): ComponentSchema | undefined => {
    if (registry.components.getComponent(component.registryId)?.type === type) return component;
    return component.children.map(visit).find(Boolean);
  };
  return schema.components.map(visit).find(Boolean);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function ProductInformationPage({ schema, registry }: Props) {
  const list = componentByType(schema, registry, "list-page");
  const table = componentByType(schema, registry, "data-table");
  const pagination = componentByType(schema, registry, "pagination");
  const dataId = schema.dataBindings[0]?.registryId;
  const records = (dataId ? registry.data.getData(dataId)?.mockData : []) as ProductRecord[];
  const tabs = stringList(list?.props.tabs).filter((tab): tab is ProductTab => productTabs.includes(tab as ProductTab));
  const columns = stringList(table?.props.columns);
  const pageSize = Number(pagination?.props.pageSize) || 100;
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(defaultProductFilters);
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>(defaultProductFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedName, setAdvancedName] = useState("");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [draftColumns, setDraftColumns] = useState(columns);
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState<"new" | "edit" | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rowMoreOpen, setRowMoreOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => filterProducts(records, { ...appliedFilters, keyword: advancedName || appliedFilters.keyword }), [records, appliedFilters, advancedName]);
  const isDraftTab = appliedFilters.tab === "草稿产品";
  const isComboTab = appliedFilters.tab === "组合产品";
  const isCustomerTab = appliedFilters.tab === "客户专属";
  const isAllTab = appliedFilters.tab === "全部";
  const isSingleTab = appliedFilters.tab === "单个产品";
  const isReadOnlyListTab = isComboTab || isCustomerTab || isAllTab;
  const supportsKeywordOptions = !isDraftTab;
  const comboCategoryColumns = ["分类编号", "分类名称"];
  const singleProductColumns = ["序号", "产品图片", "产品编号", "产品名称", "英文名称", "出厂货号", "辅助编号", "产品类型", "出厂价", "进货价", "第三方价格", "标贴费", "采购折扣", "起订量", "产品状态", "摊位号", "操作"];
  const tableColumns = isReadOnlyListTab ? [...visibleColumns.filter((column) => column !== "操作" && !comboCategoryColumns.includes(column)), ...comboCategoryColumns, "操作"] : isSingleTab ? singleProductColumns.filter((column) => visibleColumns.includes(column)) : visibleColumns;
  const visible = useMemo(() => paginateProducts(filtered, page, pageSize), [filtered, page, pageSize]);
  const pageCount = Math.max(1, Math.ceil(visible.total / pageSize));

  const applyFilters = () => { setAppliedFilters(draftFilters); setPage(1); };
  const changeFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const selectTab = (tab: ProductTab) => {
    const next = { ...draftFilters, tab };
    setDraftFilters(next);
    setAppliedFilters(next);
    setMoreOpen(false);
    setRowMoreOpen(null);
    setPage(1);
  };
  const applyAdvanced = () => { setAppliedFilters((current) => ({ ...current })); setPage(1); setAdvancedOpen(false); };
  const resetAdvanced = () => setAdvancedName("");
  const toggleColumn = (column: string) => setDraftColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  const closeColumns = () => { setDraftColumns(visibleColumns); setColumnsOpen(false); };
  const saveColumns = () => { setVisibleColumns(draftColumns); setColumnsOpen(false); };

  const moreActions = ["批量导出", "批量导入图片", "批量设置产品下架", "批量更新英文品名", "批量样品价格调整", "批量修改产品资料", "批量管理证书文件", "批量管理品牌文件", "批量管理视频", "批量加入选品车", "恢复误删数据"];
  const rowMoreActions = ["客户产品", "加入选品车", "留痕记录", "货柜箱/只计算"];
  const columnCards = [...new Set([...columns, "分类编号", "分类名称", "中文包装", "英文包装", "中文材质", "英文材质", "产品单位", "英文单位", "产品颜色", "英文颜色", "产品认证", "产品品牌", "工厂条码", "公司条码", "暗码", "产品规格", "包装规格", "内盒规格", "外箱规格", "体积/材积", "外箱毛/净重", "产品毛/净重", "内盒个数", "外箱装量", "厂商名称", "厂商编号", "联系人", "联系电话", "联系手机", "QQ", "摊位号", "热销", "在展产品数", "停产", "GCC", "实样", "侵权", "是否有视频", "是否有图", "中文备注", "英文备注", "注意事项", "功能说明", "客户备注", "登记人", "登记时间", "图片修改人", "图片修改时间", "修改人", "修改时间", "下架时间"])];

  return <article className="product-information-page" data-page-id={schema.pageId} onClick={(event) => { if (event.target === event.currentTarget) { setMoreOpen(false); setRowMoreOpen(null); } }}>
    <section className="renderer-list-page">
      <header className="renderer-page-header"><h2 className="sr-only">{String(list?.props.title ?? schema.name)}</h2><nav aria-label="状态页签">{tabs.map((tab) => <button key={tab} type="button" className={appliedFilters.tab === tab ? "is-active" : ""} onClick={() => selectTab(tab)}>{tab}</button>)}</nav></header>
      <div className="renderer-page-content">
        <form className={`renderer-search${isReadOnlyListTab ? " is-readonly-list" : ""}${supportsKeywordOptions ? " has-keyword-options" : ""}`} onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
          <input aria-label="关键词" placeholder="请输入" value={draftFilters.keyword} onChange={(event) => changeFilter("keyword", event.target.value)} />
          {supportsKeywordOptions && <span className="renderer-keyword-options" aria-label="关键词匹配选项"><i aria-hidden="true">≡</i><em aria-hidden="true" /><input type="checkbox" aria-label="关键词匹配选项" /></span>}
          <label>是否有图：<select aria-label="是否有图：" value={draftFilters.hasImage} onChange={(event) => changeFilter("hasImage", event.target.value as ProductFilters["hasImage"])}><option>全部</option><option>是</option><option>否</option></select></label>
          <label>是否停产：<select aria-label="是否停产：" value={draftFilters.discontinued} onChange={(event) => changeFilter("discontinued", event.target.value as ProductFilters["discontinued"])}><option>全部</option><option>是</option><option>否</option></select></label>
          {!isDraftTab && <label>产品状态：<select aria-label="产品状态：" value={draftFilters.status} onChange={(event) => changeFilter("status", event.target.value as ProductFilters["status"])}><option>上架</option><option>下架</option><option>全部</option></select></label>}
          <button className="dyj-button" type="submit">查询</button><button type="button" onClick={() => setAdvancedOpen(true)}>综合查询</button><button type="button" onClick={() => setImageSearchOpen((current) => !current)}>图搜</button>
        </form>
        <div className={`renderer-toolbar${isReadOnlyListTab ? " is-readonly-list" : ""}`}><div className="renderer-toolbar-left">{!isReadOnlyListTab && <><button className="dyj-button" type="button" onClick={() => setFormMode("new")}>+ 新建产品</button><button className="renderer-import" type="button">导入产品</button><button type="button">批量删除</button>{!isDraftTab && <><button type="button">打印条码</button><button type="button">复制产品</button><button type="button">选品车</button></>}<span className="renderer-menu-trigger"><button type="button" onClick={() => { setRowMoreOpen(null); setMoreOpen((current) => !current); }}>更多操作 &gt;</button>{moreOpen && <div className="renderer-menu renderer-batch-menu" role="menu" aria-label="更多操作菜单">{moreActions.map((action, index) => <button key={action} type="button" role="menuitem">{action}{index === 0 && <span>›</span>}</button>)}</div>}</span></>}</div><div className="renderer-toolbar-right" aria-label="列表工具"><button type="button">⛶</button><button type="button">⛶</button><button type="button">↻</button><button type="button">⇩</button><button type="button">▣</button><button type="button" className="renderer-icon-button" aria-label="列设置" title="列设置" onClick={() => { setDraftColumns(visibleColumns); setColumnsOpen(true); }}>☷</button>{!isReadOnlyListTab && <span className="renderer-static-tool" aria-hidden="true">▤</span>}</div></div>
        <div className={`renderer-table-wrap${isReadOnlyListTab ? " is-readonly-list" : ""}`}><table><thead><tr>{tableColumns.flatMap((column) => column === "序号" ? [<th key={column}>{column}</th>, <th key="select"><input type="checkbox" aria-label="选择全部产品" /></th>] : [<th key={column}><span>{column}</span>{column !== "操作" && <i className="renderer-sort-marks" aria-hidden="true">⌃⌄</i>}</th>])}</tr></thead><tbody>{visible.records.length ? visible.records.map((record) => <tr key={record.id}>{tableColumns.flatMap((column) => column === "序号" ? [<td key={column}>{String(record[column] ?? "—")}</td>, <td key="select"><input type="checkbox" aria-label="选择产品" /></td>] : [<td key={column} className={column === "操作" ? `renderer-actions${rowMoreOpen === record.id ? " is-menu-open" : ""}` : ""}>{column === "操作" ? <><button type="button" onClick={() => setFormMode("edit")}>编辑</button><button type="button" onClick={() => setDeleteOpen(true)}>删除</button><span className="renderer-menu-trigger"><button type="button" onClick={() => { setMoreOpen(false); setRowMoreOpen((current) => current === record.id ? null : record.id); }}>更多</button>{rowMoreOpen === record.id && <div className="renderer-menu renderer-row-menu" role="menu" aria-label="行更多操作菜单">{rowMoreActions.map((action) => <button key={action} type="button" role="menuitem">{action}</button>)}</div>}</span></> : column === "产品图片" ? <span className={`renderer-image${record[column] ? " has-image" : ""}`} aria-label={record[column] ? "产品图片占位" : "无产品图片"}>{record[column] ? <i aria-hidden="true" /> : null}</span> : String(record[column] ?? "—")}</td>])}</tr>) : <tr><td colSpan={Math.max(1, tableColumns.length + 1)}>暂无数据</td></tr>}</tbody></table></div>
        <footer className="renderer-pagination"><span>共 {visible.total} 条记录</span><select aria-label="每页记录数" value={`${pageSize}条/页`} disabled><option>{pageSize}条/页</option></select><button className="renderer-page-arrow" type="button" aria-label="上一页" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" className={page === number ? "is-active" : ""} onClick={() => setPage(number)}>{number}</button>)}<button className="renderer-page-arrow" type="button" aria-label="下一页" disabled={page === pageCount} onClick={() => setPage(Math.min(pageCount, page + 1))}>›</button><span>前往 <input aria-label="前往页码" value={page} onChange={(event) => { const target = Number(event.target.value); if (Number.isInteger(target) && target >= 1 && target <= pageCount) setPage(target); }} /> 页</span></footer>
      </div>
    </section>
    {advancedOpen && <div className="renderer-drawer-mask"><aside className="renderer-drawer renderer-advanced-drawer" role="dialog" aria-label="综合查询"><header><button type="button" aria-label="关闭此对话框" onClick={() => setAdvancedOpen(false)}>×</button><h3>综合查询</h3></header><div className="renderer-drawer-body"><section><h4>基础信息：</h4><div className="renderer-query-grid"><label>产品名称：<input aria-label="产品名称：" placeholder="输入关键词+空格分隔可多关键词匹配" value={advancedName} onChange={(event) => setAdvancedName(event.target.value)} /></label><label>出厂货号：<input placeholder={'多货号查询以","隔开'} /></label><label>产品编号：<input placeholder={'多编号查询以","隔开'} /></label><label>产品单位：<select><option>请选择</option></select></label><label>分类名称：<select><option>请选择</option></select></label><label>分类编号：<input placeholder="请输入" /></label><label>出厂价：<span className="renderer-range"><input placeholder="最低" /><i>-</i><input placeholder="最高" /></span></label><label>进货价：<span className="renderer-range"><input placeholder="最低" /><i>-</i><input placeholder="最高" /></span></label><label>产品品牌：<select><option>请选择</option></select></label><label>产品认证：<select><option>请选择</option></select></label><label>是否在展：<select><option>全部</option></select></label></div></section><section><h4>产品参数：</h4><div className="renderer-query-grid"><label>外箱装量：<span className="renderer-range"><input placeholder="最低" /><i>-</i><input placeholder="最高" /></span></label><label>中文包装：<input placeholder="请输入" /></label>{["产品规格：", "包装规格：", "外箱规格："].map((label) => <label key={label} className="renderer-query-size">{label}<span><input placeholder="长区间" /><i>-</i><input placeholder="长区间" /> cm　<input placeholder="宽区间" /><i>-</i><input placeholder="宽区间" /> cm　<input placeholder="高区间" /><i>-</i><input placeholder="高区间" /> cm</span></label>)}</div></section><section><h4>厂商信息：</h4><div className="renderer-query-grid">{["厂商编号：", "厂商名称：", "联系人：", "联系手机：", "联系电话：", "QQ："].map((label) => <label key={label}>{label}<input placeholder="请输入" /></label>)}</div></section><section><h4>其他信息：</h4><div className="renderer-query-grid"><label>侵权：<select><option>全部</option></select></label><label>13条形码：<input placeholder="请输入" /></label><label>是否热销：<select><option>全部</option></select></label><label>是否实样：<select><option>全部</option></select></label><label>中文备注：<input placeholder="请输入" /></label><label>登记人：<input placeholder="请输入" /></label><label>修改人：<input placeholder="请输入" /></label></div></section></div><footer><button type="button" onClick={resetAdvanced}>重置</button><button type="button" className="dyj-button" onClick={applyAdvanced}>确定</button></footer></aside></div>}
    {columnsOpen && <div className="renderer-drawer-mask"><aside className="renderer-drawer renderer-columns-drawer" role="dialog" aria-label="勾选您要显示的字段"><header><button type="button" aria-label="关闭此对话框" onClick={closeColumns}>×</button><h3>勾选您要显示的字段</h3></header><div className="renderer-columns-tools"><button type="button">设置全部显示</button><button type="button">排序整理</button><button type="button">恢复系统默认</button><input aria-label="字段查询" placeholder="请输入" /><button type="button" className="dyj-button">查询</button></div><div className="renderer-column-cards">{columnCards.map((column) => <label key={column} className="renderer-column-card"><input type="checkbox" aria-label={column} checked={draftColumns.includes(column)} onChange={() => toggleColumn(column)} /><span aria-hidden="true">◉</span>{column}<b aria-hidden="true">⠿</b></label>)}</div><footer><button type="button" onClick={closeColumns}>关闭</button><button type="button" className="dyj-button" onClick={saveColumns}>保存</button></footer></aside></div>}
    {imageSearchOpen && <aside className="renderer-image-search" aria-label="图搜"><label>粘贴图片网址<input placeholder="粘贴图片网址" /></label><button type="button" aria-label="图片网址检索">⌕</button><div><i aria-hidden="true">▧</i><strong>上传图片</strong><span>上传/拖拽图片到这里上传</span><small>支持格式JPG/PNG</small></div><div><i aria-hidden="true">▤</i><strong>上传文件</strong><span>上传/拖拽文件到这里上传</span><small>仅支持EXCEL文件</small></div><div><i aria-hidden="true">▣</i><strong>粘贴图片</strong><span>点击此处，然后<br />Ctrl+v 到这里</span></div></aside>}
    {deleteOpen && <div className="renderer-overlay" role="dialog" aria-label="您确定要删除吗？"><section className="renderer-confirm"><h3>您确定要删除吗？</h3><p>此操作将会删除 <b>1条</b> 产品数据</p><footer><button type="button" onClick={() => setDeleteOpen(false)}>取消</button><button type="button" className="renderer-danger" onClick={() => setDeleteOpen(false)}>确定</button></footer></section></div>}
    {formMode && <div className="renderer-form-mask"><aside className="renderer-form-drawer" role="dialog" aria-label={formMode === "new" ? "新建产品资料" : "编辑产品资料"}><header><button type="button" aria-label="关闭此对话框" onClick={() => setFormMode(null)}>×</button><h3>{formMode === "new" ? "新建产品资料" : "编辑产品资料"}</h3></header><div className="renderer-form-body"><nav>{["基础信息", "产品参数", "产品图片", "产品属性", "产品条码信息", "其他信息", "厂商信息"].map((item, index) => <a className={index === 0 ? "is-active" : ""} href={'#part' + index} key={item}>{item}</a>)}</nav><main><section id="part0"><h4>基础信息：</h4><div className="renderer-form-grid">{["产品编号", "出厂货号", "辅助编号", "产品名称", "英文名称", "产品分类", "产品单位", "出厂价", "进货价", "第三方价格", "标贴费", "采购折扣", "起订量", "厂商编号", "厂商名称", "第三语种"].map((field) => <label key={field}>{["产品编号", "出厂货号", "产品名称", "产品分类", "出厂价", "进货价", "厂商编号"].includes(field) && <b>*</b>}{field}：<input placeholder={field === "产品分类" || field === "厂商编号" ? "请选择" : "请输入"} disabled={field !== "联系人"} /></label>)}</div></section><section id="part1"><h4>产品参数：</h4><div className="renderer-form-grid renderer-params">{["内盒 / 外箱装量", "包装方式", "外箱规格", "产品规格", "外箱毛/净重", "包装规格", "产品毛/净重", "体积/材积", "产品认证", "产品颜色", "产品品牌", "中文材质", "内盒规格"].map((field) => <label key={field}>{["外箱装量", "包装方式", "外箱规格", "外箱毛/净重"].some((name) => field.includes(name)) && <b>*</b>}{field}：<input value={field.includes("规格") || field.includes("重量") || field.includes("材积") || field.includes("装量") ? "0" : ""} readOnly /></label>)}</div></section><section id="part2"><h4>产品图片：</h4><div className="renderer-image-slot">＋</div></section></main></div><footer>{formMode === "new" && <button type="button">保存草稿</button>}<button type="button" onClick={() => setFormMode(null)}>关闭</button><button type="button" className="dyj-button">确定</button></footer></aside></div>}
  </article>;
}
