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
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => filterProducts(records, appliedFilters), [records, appliedFilters]);
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

  return <article className="product-information-page" data-page-id={schema.pageId}>
    <div className="renderer-toolbar"><button className="dyj-button" type="button">+ 新建产品</button><button className="renderer-import" type="button">导入产品</button><button type="button">批量删除</button><button type="button">打印条码</button><button type="button">复制产品</button><button type="button">选品车</button><button type="button">更多操作 &gt;</button><span aria-hidden="true">⛶　⛶　☷　↻　⇩　▣　☷</span></div>
    <section className="renderer-list-page">
      <header className="renderer-page-header"><h2 className="sr-only">{String(list?.props.title ?? schema.name)}</h2><nav aria-label="状态页签">{tabs.map((tab) => <button key={tab} type="button" className={appliedFilters.tab === tab ? "is-active" : ""} onClick={() => selectTab(tab)}>{tab}</button>)}</nav></header>
      <div className="renderer-page-content">
        <form className="renderer-search" onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
          <label>是否有图：<select aria-label="是否有图：" value={draftFilters.hasImage} onChange={(event) => changeFilter("hasImage", event.target.value as ProductFilters["hasImage"])}><option>全部</option><option>是</option><option>否</option></select></label>
          <label>是否停产：<select aria-label="是否停产：" value={draftFilters.discontinued} onChange={(event) => changeFilter("discontinued", event.target.value as ProductFilters["discontinued"])}><option>全部</option><option>是</option><option>否</option></select></label>
          <label>产品状态：<select aria-label="产品状态：" value={draftFilters.status} onChange={(event) => changeFilter("status", event.target.value as ProductFilters["status"])}><option>上架</option><option>下架</option><option>全部</option></select></label>
          <input aria-label="关键词" placeholder="请输入" value={draftFilters.keyword} onChange={(event) => changeFilter("keyword", event.target.value)} />
          <button className="dyj-button" type="submit">查询</button><button type="button">综合查询</button><button type="button">图搜</button>
        </form>
        <div className="renderer-table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{visible.records.length ? visible.records.map((record) => <tr key={record.id}>{columns.map((column) => <td key={column} className={column === "操作" ? "renderer-actions" : ""}>{column === "操作" ? <><button type="button">编辑</button><button type="button">删除</button><button type="button">更多</button></> : column === "产品图片" ? <span className="renderer-image">{record[column] || ""}</span> : String(record[column] ?? "—")}</td>)}</tr>) : <tr><td colSpan={Math.max(1, columns.length)}>暂无数据</td></tr>}</tbody></table></div>
        <footer className="renderer-pagination"><span>共 {visible.total} 条记录</span><select aria-label="每页记录数" value={`${pageSize}条/页`} disabled><option>{pageSize}条/页</option></select>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" className={page === number ? "is-active" : ""} onClick={() => setPage(number)}>{number}</button>)}<span>前往 <input aria-label="前往页码" value={page} onChange={(event) => { const target = Number(event.target.value); if (Number.isInteger(target) && target >= 1 && target <= pageCount) setPage(target); }} /> 页</span></footer>
      </div>
    </section>
  </article>;
}
