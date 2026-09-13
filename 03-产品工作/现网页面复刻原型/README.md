---
title: 双引鲸复刻原型平台
type: prototype_platform
status: Phase 5 产品资料现网首屏对齐中
updated: 2026-09-13
---

# 双引鲸复刻原型平台

## 当前状态

Phase 1 已确认：建立 React + TypeScript + Vite 运行时，以及 Page、Component、Action、Data、Design、Asset 六类 Registry。首页和产品资料均已注册；只有产品资料属于后续单页试点范围。

Phase 2 已完成代码实现：产品资料页面由 Project / Page / Component / Action / Data / Design Schema 描述；保存前校验 Registry 引用、允许属性和组件层级，并输出字段路径、原因和修复提示。

当前入口为产品资料试点的现网首屏对齐版。2026-09-13 已通过人工登录后的 Playwright 只读采集核对 `/tsProductInformation`；综合查询、新建/编辑、图搜、列设置和删除确认仍待逐层采集后接入。

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

等待 Phase 2 检查和廖送平确认后，实施 Schema Renderer。
