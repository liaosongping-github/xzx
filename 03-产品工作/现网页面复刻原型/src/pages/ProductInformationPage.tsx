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
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => filterProducts(records, { ...appliedFilters, keyword: advancedName || appliedFilters.keyword }), [records, appliedFilters, advancedName]);
  const visible = useMemo(() => paginateProducts(filtered, page, pageSize), [filtered, page, pageSize]);
  const pageCount = Math.max(1, Math.ceil(visible.total / pageSize));

  const applyFilters = () => { setAppliedFilters(draftFilters); setPage(1); };
  const changeFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const selectTab = (tab: ProductTab) => {
    const next = { ...draftFilters, tab };
    setDraftFilters(next);
    setAppliedFilters(next);
    setPage(1);
  };
  const applyAdvanced = () => { setAppliedFilters((current) => ({ ...current })); setPage(1); setAdvancedOpen(false); };
  const resetAdvanced = () => setAdvancedName("");
  const toggleColumn = (column: string) => setDraftColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  const closeColumns = () => { setDraftColumns(visibleColumns); setColumnsOpen(false); };
  const saveColumns = () => { setVisibleColumns(draftColumns); setColumnsOpen(false); };

  return <article className="product-information-page" data-page-id={schema.pageId}>
    <div className="renderer-toolbar"><button className="dyj-button" type="button" onClick={() => setFormMode("new")}>+ 新建产品</button><button className="renderer-import" type="button">导入产品</button><button type="button">批量删除</button><button type="button">打印条码</button><button type="button">复制产品</button><button type="button">选品车</button><button type="button">更多操作 &gt;</button><span aria-hidden="true">⛶　⛶　☷　↻　⇩　▣</span><button type="button" className="renderer-icon-button" aria-label="列设置" title="列设置" onClick={() => { setDraftColumns(visibleColumns); setColumnsOpen(true); }}>☷</button></div>
    <section className="renderer-list-page">
      <header className="renderer-page-header"><h2 className="sr-only">{String(list?.props.title ?? schema.name)}</h2><nav aria-label="状态页签">{tabs.map((tab) => <button key={tab} type="button" className={appliedFilters.tab === tab ? "is-active" : ""} onClick={() => selectTab(tab)}>{tab}</button>)}</nav></header>
      <div className="renderer-page-content">
        <form className="renderer-search" onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
          <label>是否有图：<select aria-label="是否有图：" value={draftFilters.hasImage} onChange={(event) => changeFilter("hasImage", event.target.value as ProductFilters["hasImage"])}><option>全部</option><option>是</option><option>否</option></select></label>
          <label>是否停产：<select aria-label="是否停产：" value={draftFilters.discontinued} onChange={(event) => changeFilter("discontinued", event.target.value as ProductFilters["discontinued"])}><option>全部</option><option>是</option><option>否</option></select></label>
          <label>产品状态：<select aria-label="产品状态：" value={draftFilters.status} onChange={(event) => changeFilter("status", event.target.value as ProductFilters["status"])}><option>上架</option><option>下架</option><option>全部</option></select></label>
          <input aria-label="关键词" placeholder="请输入" value={draftFilters.keyword} onChange={(event) => changeFilter("keyword", event.target.value)} />
          <button className="dyj-button" type="submit">查询</button><button type="button" onClick={() => setAdvancedOpen(true)}>综合查询</button><button type="button" onClick={() => setImageSearchOpen((current) => !current)}>图搜</button>
        </form>
        <div className="renderer-table-wrap"><table><thead><tr>{visibleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{visible.records.length ? visible.records.map((record) => <tr key={record.id}>{visibleColumns.map((column) => <td key={column} className={column === "操作" ? "renderer-actions" : ""}>{column === "操作" ? <><button type="button" onClick={() => setFormMode("edit")}>编辑</button><button type="button" onClick={() => setDeleteOpen(true)}>删除</button><button type="button">更多</button></> : column === "产品图片" ? <span className="renderer-image">{record[column] || ""}</span> : String(record[column] ?? "—")}</td>)}</tr>) : <tr><td colSpan={Math.max(1, visibleColumns.length)}>暂无数据</td></tr>}</tbody></table></div>
        <footer className="renderer-pagination"><span>共 {visible.total} 条记录</span><select aria-label="每页记录数" value={`${pageSize}条/页`} disabled><option>{pageSize}条/页</option></select>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" className={page === number ? "is-active" : ""} onClick={() => setPage(number)}>{number}</button>)}<span>前往 <input aria-label="前往页码" value={page} onChange={(event) => { const target = Number(event.target.value); if (Number.isInteger(target) && target >= 1 && target <= pageCount) setPage(target); }} /> 页</span></footer>
      </div>
    </section>
    {advancedOpen && <div className="renderer-overlay" role="dialog" aria-label="综合查询"><section className="renderer-modal renderer-advanced"><h3>综合查询</h3><button type="button" className="renderer-modal-close" aria-label="关闭此对话框" onClick={() => setAdvancedOpen(false)}>×</button><h4>基础信息：</h4><label>产品名称：<input aria-label="产品名称：" value={advancedName} onChange={(event) => setAdvancedName(event.target.value)} /></label><h4>产品参数：</h4><p className="renderer-muted">更多查询字段已按现网证据登记，结果规则待补充。</p><h4>厂商信息：</h4><h4>其他信息：</h4><footer><button type="button" onClick={resetAdvanced}>重置</button><button type="button" className="dyj-button" onClick={applyAdvanced}>确定</button></footer></section></div>}
    {columnsOpen && <div className="renderer-overlay" role="dialog" aria-label="勾选您要显示的字段"><section className="renderer-modal renderer-columns"><h3>勾选您要显示的字段</h3><button type="button" className="renderer-modal-close" aria-label="关闭此对话框" onClick={closeColumns}>×</button><div className="renderer-modal-actions"><button type="button">设置全部显示</button><button type="button">排序整理</button><button type="button">恢复系统默认</button><input aria-label="字段查询" placeholder="请输入" /><button type="button">查询</button></div><div className="renderer-column-list">{columns.map((column) => <label key={column}><input type="checkbox" aria-label={column} checked={draftColumns.includes(column)} onChange={() => toggleColumn(column)} />{column}</label>)}</div><footer><button type="button" onClick={closeColumns}>关闭</button><button type="button" className="dyj-button" onClick={saveColumns}>保存</button></footer></section></div>}
    {imageSearchOpen && <aside className="renderer-image-search" aria-label="图搜"><label>粘贴图片网址<input placeholder="粘贴图片网址" /></label><button type="button" aria-label="图片网址检索">⌕</button><div><strong>上传图片</strong><span>上传/拖拽图片到这里上传</span><small>支持格式JPG/PNG</small></div><div><strong>上传文件</strong><span>上传/拖拽文件到这里上传</span><small>仅支持EXCEL文件</small></div><div><strong>粘贴图片</strong><span>点击此处，然后 Ctrl+v 到这里</span></div></aside>}
    {deleteOpen && <div className="renderer-overlay" role="dialog" aria-label="您确定要删除吗？"><section className="renderer-confirm"><h3>您确定要删除吗？</h3><p>此操作将会删除 <b>1条</b> 产品数据</p><footer><button type="button" onClick={() => setDeleteOpen(false)}>取消</button><button type="button" className="renderer-danger" onClick={() => setDeleteOpen(false)}>确定</button></footer></section></div>}
    {formMode && <div className="renderer-overlay" role="dialog" aria-label={formMode === "new" ? "新建产品资料" : "编辑产品资料"}><section className="renderer-modal renderer-form"><h3>{formMode === "new" ? "新建产品资料" : "编辑产品资料"}</h3><nav>基础信息　产品参数　产品图片　产品属性　产品条码信息　其他信息　厂商信息</nav><h4>基础信息：</h4><div className="renderer-form-grid">{["产品编号", "出厂货号", "辅助编号", "产品名称", "英文名称", "产品分类", "产品单位", "出厂价", "进货价", "第三方价格", "标贴费", "采购折扣", "起订量", "厂商编号", "厂商名称", "第三语种"].map((field) => <label key={field}>{["产品编号", "出厂货号", "产品名称", "产品分类", "出厂价", "进货价", "厂商编号"].includes(field) && <b>*</b>}{field}<input disabled={field !== "联系人"} /></label>)}</div><h4>产品参数：</h4><h4>产品图片：</h4><h4>产品属性：</h4><h4>产品条码信息：</h4><h4>其他信息：</h4><h4>厂商信息：</h4><footer>{formMode === "new" && <button type="button">保存草稿</button>}<button type="button" onClick={() => setFormMode(null)}>关闭</button><button type="button" className="dyj-button">确定</button></footer></section></div>}
  </article>;
}
