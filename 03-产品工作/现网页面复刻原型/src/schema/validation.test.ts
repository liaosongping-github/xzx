import { describe, expect, it } from "vitest";
import { prototypeRegistry } from "../registry";
import { productInformationProjectSchema } from "./product-information";
import { validateProjectSchema } from "./validation";

function cloneSchema() {
  return structuredClone(productInformationProjectSchema);
}

describe("产品资料 Schema 校验", () => {
  it("接受引用已注册资源的产品资料试点 Schema", () => {
    expect(validateProjectSchema(cloneSchema(), prototypeRegistry)).toEqual({ valid: true, issues: [] });
  });

  it("指出未知组件的路径与修复方式", () => {
    const schema = cloneSchema();
    schema.pages[0].components[0].children[0].registryId = "missing-component";
    const result = validateProjectSchema(schema, prototypeRegistry);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({
      path: "pages[0].components[0].children[0].registryId",
      reason: "未知组件：missing-component"
    }));
  });

  it("拒绝未声明属性和非法组件嵌套", () => {
    const schema = cloneSchema();
    schema.pages[0].components[0].children[0].props.unknownProperty = true;
    schema.pages[0].components[0].children[0].children.push({
      ...schema.pages[0].components[0].children[1], componentId: "nested-table"
    });
    const result = validateProjectSchema(schema, prototypeRegistry);
    expect(result.valid).toBe(false);
    expect(result.issues.map((entry) => entry.path)).toContain("pages[0].components[0].children[0].props.unknownProperty");
    expect(result.issues.map((entry) => entry.reason)).toContain("快捷查询条 不允许嵌套 data-table");
  });
});
