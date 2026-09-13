---
title: 双引鲸复刻测试与验收清单
type: test_acceptance_inventory
status: 基础设施测试部分通过，产品资料页面测试存在失败
updated: 2026-09-13
---

# 测试与验收清单

| 范围 | 方法/命令 | 预期 | 2026-09-13 实测 | 结论 |
|---|---|---|---|---|
| Registry/Schema/Renderer/组件/Mock 单元集成 | `npm test -- --run` | 全部通过 | 7 文件；23 项中 21 通过、2 失败 | 不通过 |
| 综合查询 | `ProductInformationPage.test.tsx` | 打开、重置、确定过滤 | 找不到“产品名称”输入框 | 未实现，不得验收 |
| 列设置 | `ProductInformationPage.test.tsx` | 关闭不保存、保存后列显隐 | 找不到“列设置”按钮 | 未实现，不得验收 |
| TypeScript/Vite 构建 | `npm run build` | 退出码 0 | 通过 | 通过 |
| 只读采集工具 | `node --test 08-自动化/playwright-tools/examples/capture-dyj-readonly.test.js` | 全部通过 | 3/3 通过 | 通过（改动未提交） |
| 产品资料本地关键路径 E2E | Playwright 本地 E2E | 全路径通过 | 未建立 | 未开始 |
| 产品资料同视口视觉对照 | 现网/本地分区截图 | 差异归零或批准豁免 | 未执行 | 未开始 |
| 产品资料人工验收 | 逐项清单演示 | 廖送平确认 | 未执行 | 未确认 |

测试失败的直接原因是工作区已有两个先行失败测试，而对应综合查询和列设置实现尚不存在；这是正确暴露的 Phase 5 未完成项，不回退测试，也不把基础阶段测试历史结果冒充当前全绿。
