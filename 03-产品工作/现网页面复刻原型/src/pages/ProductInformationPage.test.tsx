import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { prototypeRegistry } from "../registry";
import { productInformationProjectSchema } from "../schema";
import { ProductInformationPage } from "./ProductInformationPage";

const page = productInformationProjectSchema.pages[0];

describe("产品资料页面", () => {
  it("点击查询后按现网四项条件更新可见记录", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);

    fireEvent.change(screen.getByRole("textbox", { name: "关键词" }), { target: { value: "遥控" } });
    fireEvent.change(screen.getByRole("combobox", { name: "是否有图：" }), { target: { value: "是" } });
    fireEvent.click(screen.getByRole("button", { name: "查询" }));

    expect(screen.getByText("MOCK-REMOTE-001")).toBeInTheDocument();
    expect(screen.queryByText("MOCK-NOIMAGE-001")).not.toBeInTheDocument();
  });

  it("切换页签后以该页签过滤并重置分页", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);

    fireEvent.click(screen.getByRole("button", { name: "草稿产品" }));

    expect(screen.getByText("MOCK-DRAFT-001")).toBeInTheDocument();
    expect(screen.queryByText("MOCK-REMOTE-001")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toHaveClass("is-active");
  });

  it("综合查询确定后按产品名称过滤，重置恢复空值", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);
    fireEvent.click(screen.getByRole("button", { name: "综合查询" }));
    const nameInput = screen.getByRole("textbox", { name: "产品名称：" });
    fireEvent.change(nameInput, { target: { value: "遥控" } });
    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(nameInput).toHaveValue("");
    fireEvent.change(nameInput, { target: { value: "遥控" } });
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(screen.getByText("MOCK-REMOTE-001")).toBeInTheDocument();
    expect(screen.queryByText("MOCK-NOIMAGE-001")).not.toBeInTheDocument();
  });

  it("列设置关闭不改变表头，保存后应用显隐", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);
    fireEvent.click(screen.getByRole("button", { name: "列设置" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "产品状态" }));
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.getByRole("columnheader", { name: "产品状态" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "列设置" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "产品状态" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(screen.queryByRole("columnheader", { name: "产品状态" })).not.toBeInTheDocument();
  });

  it("图搜可重复点击关闭且不要求上传文件", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);
    fireEvent.click(screen.getByRole("button", { name: "图搜" }));
    expect(screen.getByText("粘贴图片网址")).toBeInTheDocument();
    expect(screen.getByText("上传/拖拽图片到这里上传")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "图搜" }));
    expect(screen.queryByText("粘贴图片网址")).not.toBeInTheDocument();
  });

  it("行删除必须经确认层，取消不移除记录", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);
    fireEvent.click(screen.getAllByRole("button", { name: "删除" })[0]);
    expect(screen.getByText("您确定要删除吗？")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.getByText("MOCK-REMOTE-001")).toBeInTheDocument();
  });

  it("新建和编辑打开已取证的产品资料表单壳", () => {
    render(<ProductInformationPage schema={page} registry={prototypeRegistry} />);
    fireEvent.click(screen.getByRole("button", { name: "+ 新建产品" }));
    expect(screen.getByRole("dialog", { name: "新建产品资料" })).toBeInTheDocument();
    expect(screen.getByText("保存草稿")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    fireEvent.click(screen.getAllByRole("button", { name: "编辑" })[0]);
    expect(screen.getByRole("dialog", { name: "编辑产品资料" })).toBeInTheDocument();
    expect(screen.queryByText("保存草稿")).not.toBeInTheDocument();
  });
});
