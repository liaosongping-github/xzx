---
title: 双引鲸复刻原型平台
type: prototype_platform
status: Phase 0.5 全站普查待完成；产品资料局部取证与实现中
updated: 2026-09-13
---

# 双引鲸复刻原型平台

## 当前状态

Phase 1–3 的 Registry、Schema 校验和 Renderer 基础契约已存在，但按 2026-09-13 最新 1:1 计划复核后，它们只代表基础设施成果，不代表页面验收。当前运行入口直接使用专用 `ProductInformationPage`，尚未闭合通用 `PageRenderer` 的单一 Schema 渲染链路。

Phase 2 已完成代码实现：产品资料页面由 Project / Page / Component / Action / Data / Design Schema 描述；保存前校验 Registry 引用、允许属性和组件层级，并输出字段路径、原因和修复提示。

当前入口只完成产品资料默认首屏的局部对齐。2026-09-13 的当次证据仅覆盖 `/tsProductInformation` 默认单个产品首屏；综合查询、新建/编辑、图搜、列设置、删除确认、更多菜单、异常状态、视觉度量和 E2E 均未完成，不得称为产品资料 1:1 已完成。

全系统复刻范围先以知识库 13 个一级模块、50 个叶子入口为基线，必须完成同周期现网普查后冻结。审计与九类清单见 `docs/双引鲸复刻原型平台/`。

## 本地运行

```powershell
npm install
npm run dev
```

默认地址由 Vite 输出。验证命令：

```powershell
npm test
npm run build
```

## 目录

- `src/registry/`：六类 Registry 的类型、CRUD 实现和种子数据。
- `src/schema/`：六类 Schema 契约、产品资料 Schema 种子和校验器。
- `src/App.tsx`：Schema 校验状态页。
- `src/**/*.test.ts*`：Registry、Schema 和入口验证测试。

## 下一步

先完成 Phase 0.5 全站菜单/入口普查；产品资料只按已采集证据继续，先取证后实现。修正优先级见 `difference-waiver-inventory.md`，首项是消除专用页面绕过通用 Renderer 的双渲染路径。
