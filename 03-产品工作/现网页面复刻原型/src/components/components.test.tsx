import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell, Button, Checkbox, DatePicker, Icon, Input, Radio, Select, Tag } from "./index";

describe("Phase 4 基础组件", () => {
  it("AppShell 提供双引鲸全局壳和页面内容插槽", () => {
    render(<AppShell title="产品资料"><div>页面内容</div></AppShell>);
    expect(screen.getByText("双引鲸")).toBeInTheDocument();
    expect(screen.getByText("产品资料", { selector: ".dyj-tab.is-active" })).toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });

  it("AppShell 对齐现网首屏的模块导航、菜单查询和业务页签", () => {
    render(<AppShell title="产品资料"><div>页面内容</div></AppShell>);

    expect(screen.getByRole("navigation", { name: "主导航" })).toHaveTextContent("小竹熊选品");
    expect(screen.getByRole("navigation", { name: "主导航" })).toHaveTextContent("数据分析");
    expect(screen.getByRole("textbox", { name: "菜单查询" })).toBeInTheDocument();
    expect(screen.getByText("导入产品")).toBeInTheDocument();
    expect(screen.getByText("客户账号")).toBeInTheDocument();
  });

  it("基础表单组件暴露可访问名称和受控属性", () => {
    render(<><Button>查询</Button><Input aria-label="关键词" value="玩具" readOnly /><Select aria-label="状态" value="启用" onChange={() => undefined}><option>启用</option></Select></>);
    expect(screen.getByRole("button", { name: "查询" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "关键词" })).toHaveValue("玩具");
    expect(screen.getByRole("combobox", { name: "状态" })).toHaveValue("启用");
  });

  it("补齐基础控件并保留原生表单语义", () => {
    render(<><Checkbox aria-label="启用" defaultChecked /><Radio aria-label="类型" name="type" value="产品" /><DatePicker aria-label="日期" value="2026-09-13" readOnly /><Tag>已启用</Tag><Icon name="search" /></>);
    expect(screen.getByRole("checkbox", { name: "启用" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "类型" })).toHaveAttribute("value", "产品");
    expect(screen.getByLabelText("日期")).toHaveValue("2026-09-13");
    expect(screen.getByText("已启用")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "search" })).toBeInTheDocument();
  });
});
