---
title: 双引鲸复刻原型平台架构勘察
type: architecture_inventory
status: 勘察完成，待选定运行时
updated: 2026-09-10
---

# 架构勘察

## 当前基线（已核验）

- 工作区没有根级 `package.json`、React/Vite 配置或应用测试配置；不能在原有应用上增量开发。
- 已有可复用资产是静态 HTML 原型（21 个 HTML）、双引鲸 CSS/JS 壳层和 HTML 片段组件；它们服务于现有需求原型，不是 Schema 驱动运行时。
- `08-自动化/playwright-tools/` 已安装 Playwright `1.62.1` 和 Chromium；另有已登录的贸易系统“产品资料”浏览器标签，现网只读采集条件具备。
- 当前 `现网页面复刻原型/` 为纳入 Git 的 React/Vite 运行时；豆包阶段 1 静态成果单独保留在 `现网复刻原型-豆包/`，浏览器中遗留的本地原型标签不得当作当前分支的源代码证据。

## 与 Master Implementation Plan 的差异

| 目标能力 | 当前情况 | 缺口 |
|---|---|---|
| Page / Component / Action / Data / Design / Asset Registry | 无 | 需建立类型、查询接口和初始注册数据 |
| 可校验 Schema | 无 | 需定义 Page、Component、Action、Data 的校验边界 |
| Schema Renderer | 无 | 需建立注册表解析与 React 渲染路径 |
| Mock Runtime | 仅各原型内嵌演示数据 | 需统一数据契约与 CRUD/筛选/分页能力 |
| 可复用组件库 | 有 HTML 片段与规范 | 需迁移为可注册、可测试的运行时组件 |
| 自动化验证 | 有采集工具，无复刻应用 E2E | 需添加本地应用测试和关键路径对照 |
| 编辑器、版本、Agent | 无 | 后续阶段，当前不提前实现 |

## 推荐的最小架构

新建一个独立的 React + TypeScript + Vite 应用，作为 `现网页面复刻原型/` 的唯一运行时；保留豆包静态 HTML/CSS/片段作为视觉与交互参考，不将其直接作为第二套页面事实源。

```text
现网只读观察 / 既有设计规范
              ↓
Registry + Schema + Mock 数据
              ↓
React Renderer
              ↓
首页、产品资料（阶段 1）
              ↓
本地 Playwright 验证
```

原因：它与已确认的 Registry / Schema / Renderer 路线一致，且可让后续 Visual Editor 与 Agent 共享数据。继续扩大静态 HTML 虽可更快交付单页，但会形成与平台目标冲突的第二套实现。

## 工具基线

- Node.js：在创建应用前确认实际版本；Vite 8 要求 Node.js `20.19+` 或 `22.12+`，见 [Vite Getting Started](https://vite.dev/guide/)。
- 前端：React 使用稳定发行线；当前官方已发布 React 19.3，见 [React Versions](https://react.dev/versions)。具体依赖版本在建仓时由锁文件固定。
- 测试：Vitest（单元测试）+ Playwright（端到端）；不使用现有 `playwright-tools` 的示例脚本作为产品测试框架。
- 视觉：迁移并引用 `03-产品工作/设计规范/双引鲸/` 的 token、壳层和组件规范；任何与现网不一致处按证据更新规范。

## 非目标

- 不连接或写入现网业务接口。
- 不处理真实登录凭据、权限配置或生产数据。
- 不在阶段 1 引入 Visual Editor、版本发布、依赖图、审计或 Agent 自然语言改页。
