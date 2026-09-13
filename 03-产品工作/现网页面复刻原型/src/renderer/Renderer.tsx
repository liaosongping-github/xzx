import { Component, type ReactNode, useMemo, useState } from "react";
import type { ComponentRecord, PrototypeRegistry } from "../registry/types";
import type { ComponentSchema, PageSchema } from "../schema/types";
import { validatePageSchema } from "../schema/validation";

type RendererProps = {
  schema: PageSchema;
  registry: PrototypeRegistry;
};

type ComponentRendererProps = {
  schema: ComponentSchema;
  registry: PrototypeRegistry;
};

type RegisteredComponentRendererProps = {
  schema: ComponentSchema;
  record: ComponentRecord;
  children: ReactNode;
  registry: PrototypeRegistry;
};

type RegisteredComponentRenderer = (props: RegisteredComponentRendererProps) => ReactNode;

function stringProp(schema: ComponentSchema, key: string, fallback = ""): string {
  const value = schema.props[key];
  return typeof value === "string" ? value : fallback;
}

function arrayProp(schema: ComponentSchema, key: string): unknown[] {
  return Array.isArray(schema.props[key]) ? schema.props[key] : [];
}

const componentRenderers: Record<string, RegisteredComponentRenderer> = {
  "list-page": ({ schema, record, children }) => (
    <section className="renderer-list-page" data-component-id={schema.componentId}>
      <header className="renderer-page-header">
        <h2 className="sr-only">{stringProp(schema, "title", record.name)}</h2>
        <nav aria-label="状态页签">
          {arrayProp(schema, "tabs").map((tab) => (
            <button type="button" className={String(tab) === "单个产品" ? "is-active" : ""} key={String(tab)}>{String(tab)}</button>
          ))}
        </nav>
      </header>
      <div className="renderer-page-content">{children}</div>
    </section>
  ),
  "quick-search-bar": ({ schema }) => (
    <form className="renderer-search" data-component-id={schema.componentId} onSubmit={(event) => event.preventDefault()}>
      <label>
        <input aria-label="关键词" name="keyword" placeholder={stringProp(schema, "placeholder", "请输入")} />
      </label>
      <label>是否有图：<select defaultValue="全部"><option>全部</option><option>有图</option><option>无图</option></select></label>
      <label>是否停产：<select defaultValue="全部"><option>全部</option><option>停产</option><option>未停产</option></select></label>
      <label>产品状态：<select defaultValue="上架"><option>上架</option><option>下架</option><option>全部</option></select></label>
      <button className="dyj-button" type="submit">查询</button><button type="button">综合查询</button><button type="button">图搜</button>
    </form>
  ),
  "data-table": ({ schema, registry }) => {
    const columns = arrayProp(schema, "columns").map(String);
    const data = registry.data.getData("data-product-information")?.mockData ?? [];
    return (
      <div className="renderer-table-wrap" data-component-id={schema.componentId}>
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{data.length ? data.map((row) => <tr key={String((row as { id: string }).id)}>{columns.map((column) => <td key={column} className={column === "操作" ? "renderer-actions" : ""}>{column === "操作" ? <><button>编辑</button><button>删除</button><button>更多</button></> : column === "产品图片" ? <span className="renderer-image">▣</span> : String((row as Record<string, unknown>)[column] ?? "—")}</td>)}</tr>) : <tr><td colSpan={Math.max(columns.length, 1)}>暂无数据</td></tr>}</tbody>
        </table>
      </div>
    );
  },
  pagination: ({ schema }) => (
    <footer className="renderer-pagination" data-component-id={schema.componentId}>
      {schema.componentId === "product-pagination" ? <><span>共 6051 条记录</span><select defaultValue="100条/页"><option>100条/页</option></select><button type="button" className="is-active">1</button><button type="button">2</button><button type="button">3</button><span>… 61</span><span>前往 <input aria-label="前往页码" defaultValue="1" /> 页</span></> : <span>共 0 条</span>}
    </footer>
  )
};

function ComponentRenderer({ schema, registry }: ComponentRendererProps) {
  if (!schema.visible) {
    return null;
  }

  const record = registry.components.getComponent(schema.registryId);
  if (!record) {
    throw new Error(`未知组件：${schema.registryId}`);
  }

  const renderer = componentRenderers[record.type];
  if (!renderer) {
    throw new Error(`未实现组件渲染器：${record.type}`);
  }

  return renderer({
    schema,
    record,
    children: schema.children.map((child) => (
      <ComponentRenderer key={child.componentId} schema={child} registry={registry} />
    )),
    registry
  });
}

type RendererErrorBoundaryState = { error: Error | null };

class RendererErrorBoundary extends Component<{ children: ReactNode }, RendererErrorBoundaryState> {
  state: RendererErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RendererErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div role="alert" className="renderer-error">页面渲染失败：{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export function PageRenderer({ schema, registry }: RendererProps) {
  const validation = validatePageSchema(schema, registry);
  if (!validation.valid) {
    return <div role="alert" className="renderer-error">Schema 校验失败：{validation.issues[0]?.reason}</div>;
  }

  return (
    <RendererErrorBoundary>
      <article className="renderer-page" data-page-id={schema.pageId}>
        <div className="renderer-toolbar"><button className="dyj-button">+ 新建产品</button><button className="renderer-import">导入产品</button><button>批量删除</button><button>打印条码</button><button>复制产品</button><button>选品车</button><button>更多操作 &gt;</button><span>⛶　⛶　☷　↻　⇩　▣　☷</span></div>{schema.components.map((component) => (
          <ComponentRenderer key={component.componentId} schema={component} registry={registry} />
        ))}
      </article>
    </RendererErrorBoundary>
  );
}
