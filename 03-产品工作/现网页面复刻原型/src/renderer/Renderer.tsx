import { Component, type ReactNode } from "react";
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
        <h2>{stringProp(schema, "title", record.name)}</h2>
        <nav aria-label="状态页签">
          {arrayProp(schema, "tabs").map((tab) => (
            <button type="button" key={String(tab)}>{String(tab)}</button>
          ))}
        </nav>
      </header>
      <div className="renderer-page-content">{children}</div>
    </section>
  ),
  "quick-search-bar": ({ schema }) => (
    <form className="renderer-search" data-component-id={schema.componentId} onSubmit={(event) => event.preventDefault()}>
      <label>
        关键词
        <input name="keyword" placeholder={stringProp(schema, "placeholder", "请输入关键词")} />
      </label>
      <button type="submit">查询</button>
    </form>
  ),
  "data-table": ({ schema }) => {
    const columns = arrayProp(schema, "columns").map(String);
    return (
      <div className="renderer-table-wrap" data-component-id={schema.componentId}>
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody><tr><td colSpan={Math.max(columns.length, 1)}>暂无数据</td></tr></tbody>
        </table>
      </div>
    );
  },
  pagination: ({ schema }) => (
    <footer className="renderer-pagination" data-component-id={schema.componentId}>
      <span>共 0 条</span><button type="button" disabled>上一页</button><button type="button" disabled>下一页</button>
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
    ))
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
        {schema.components.map((component) => (
          <ComponentRenderer key={component.componentId} schema={component} registry={registry} />
        ))}
      </article>
    </RendererErrorBoundary>
  );
}
