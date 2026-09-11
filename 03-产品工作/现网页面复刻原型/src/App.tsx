import { prototypeRegistry } from "./registry";
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

  return (
    <main className="phase-one-shell">
      <p className="eyebrow">双引鲸复刻原型平台</p>
      <h1>Phase 1 Registry 基座</h1>
      <p className="summary">产品资料试点的页面、组件、动作、数据、设计和资源已进入统一 Registry。</p>
      <section aria-label="Registry 统计" className="registry-grid">
        {registrySections.map(([label, count]) => (
          <article key={label}>
            <strong>{count}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <section className="seed-card">
        <h2>{productPage?.name}</h2>
        <dl>
          <div><dt>路由</dt><dd>{productPage?.route}</dd></div>
          <div><dt>范围</dt><dd>{String(productPage?.metadata.implementationScope)}</dd></div>
          <div><dt>Schema</dt><dd>{productPage?.schemaId}</dd></div>
        </dl>
      </section>
    </main>
  );
}
