import { prototypeRegistry } from "./registry";
import { productInformationProjectSchema, validateProjectSchema } from "./schema";
import { ProductInformationPage } from "./pages/ProductInformationPage";
import { AppShell } from "./components";
import "./app.css";

export default function App() {
  const validation = validateProjectSchema(productInformationProjectSchema, prototypeRegistry);

  return (
    <AppShell title="产品资料"><main className="phase-one-shell">
      <section className={`validation-card ${validation.valid ? "validation-pass" : "validation-fail"}`} aria-label="Schema 校验结果">
        <span>{validation.valid ? "Schema 校验通过" : "Schema 校验未通过"}</span>
      </section>
      <section className="renderer-card" aria-label="产品资料页面预览"><ProductInformationPage schema={productInformationProjectSchema.pages[0]} registry={prototypeRegistry} /></section>
    </main></AppShell>
  );
}
