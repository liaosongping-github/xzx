---
title: 双引鲸复刻原型平台
type: prototype_platform
status: Phase 1 待确认
updated: 2026-09-11
---

# 双引鲸复刻原型平台

## 当前状态

Phase 1 已完成：建立 React + TypeScript + Vite 运行时，以及 Page、Component、Action、Data、Design、Asset 六类 Registry。首页和产品资料均已注册；只有产品资料属于后续单页试点范围。

当前入口仅展示 Registry 读取结果，不是产品资料正式复刻页。Phase 2 完成 Schema 契约和校验后，才能进入 Renderer、Mock 和产品资料高保真实现。

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
- `src/App.tsx`：Phase 1 运行时挂载验证页面。
- `src/registry/registry.test.ts`：Registry CRUD 与种子测试。

## 下一步

等待 Phase 1 检查和廖送平确认后，实施 Page / Component / Action / Data / Design Schema 及校验器。
