import { prototypeRegistry } from "./registry";
import { productInformationProjectSchema, validateProjectSchema } from "./schema";
import { PageRenderer } from "./renderer/Renderer";
import "./app.css";

const registrySections = [
  ["页面", prototypeRegistry.pages.listPages().length],
  ["组件", prototypeRegistry.components.listComponents().length],
  ["动作", prototypeRegistry.actions.listActions().length],
  ["数据源", prototypeRegistry.data.listData().length],
  ["设计令牌", prototypeRegistry.design.listDesign().length],
  ["资源", prototypeRegistry.assets.listAssets().length]
];

export default function App() {
  const productPage = prototypeRegistry.pages.getPage("page-product-information");
  const validation = validateProjectSchema(productInformationProjectSchema, prototypeRegistry);

  return (
    <main className="phase-one-shell">
      <p className="eyebrow">双引鲸复刻原型平台</p>
      <h1>Phase 3 Schema Renderer</h1>
      <p className="summary">产品资料试点由同一份 Schema 校验并递归渲染，未知 Registry 组件会在边界内报告错误。</p>
      <section aria-label="Registry 统计" className="registry-grid">
        {registrySections.map(([label, count]) => (
          <article key={label}>
            <strong>{count}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <section className={`validation-card ${validation.valid ? "validation-pass" : "validation-fail"}`} aria-label="Schema 校验结果">
        <h2>{validation.valid ? "Schema 校验通过" : "Schema 校验未通过"}</h2>
        <p>{validation.valid ? "产品资料页面可安全进入后续 Renderer 阶段。" : `发现 ${validation.issues.length} 个问题。`}</p>
      </section>
      <section className="seed-card">
        <h2>{productPage?.name}</h2>
        <dl>
          <div><dt>路由</dt><dd>{productPage?.route}</dd></div>
          <div><dt>范围</dt><dd>{String(productPage?.metadata.implementationScope)}</dd></div>
          <div><dt>Schema</dt><dd>{productPage?.schemaId}</dd></div>
        </dl>
      </section>
      <section className="renderer-card" aria-label="产品资料页面预览">
        <h2>产品资料页面预览</h2>
        <PageRenderer schema={productInformationProjectSchema.pages[0]} registry={prototypeRegistry} />
      </section>
    </main>
  );
}
