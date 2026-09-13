---
title: 双引鲸复刻原型平台
type: prototype_platform
status: Phase 0.5 产品资料专项普查与复刻中
updated: 2026-09-13
---

# 双引鲸复刻原型平台

## 当前状态

Phase 1–3 的 Registry、Schema 校验和 Renderer 基础契约已存在，但按 2026-09-13 最新 1:1 计划复核后，它们只代表基础设施成果，不代表页面验收。当前运行入口直接使用专用 `ProductInformationPage`，尚未闭合通用 `PageRenderer` 的单一 Schema 渲染链路。

Phase 2 已完成代码实现：产品资料页面由 Project / Page / Component / Action / Data / Design Schema 描述；保存前校验 Registry 引用、允许属性和组件层级，并输出字段路径、原因和修复提示。

当前入口只完成产品资料默认首屏的局部对齐。2026-09-13 的当次证据仅覆盖 `/tsProductInformation` 默认单个产品首屏；综合查询、新建/编辑、图搜、列设置、删除确认、更多菜单、异常状态、视觉度量和 E2E 均未完成，不得称为产品资料 1:1 已完成。

知识库 13 个一级模块、50 个叶子入口仅保留为未来范围索引。当前不做全网普查，只完成产品资料全状态取证、1:1 复刻，并同步沉淀组件、设计规范、Schema、Mock 和验收方法。审计与九类清单见 `docs/双引鲸复刻原型平台/`。

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

只完成产品资料专项普查与复刻：先取证一个状态，再实现并同步沉淀组件和设计规范。修正优先级见 `difference-waiver-inventory.md`，首项是消除专用页面绕过通用 Renderer 的双渲染路径。产品资料通过廖送平验收前，不启动全网普查。
