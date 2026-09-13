---
title: 双引鲸复刻系统目录与覆盖清单
type: page_inventory
status: 一级、二级菜单基线目录已建立；本轮现网可见性待复核
updated: 2026-09-14
---

# 系统目录与覆盖清单

> 唯一范围目录。`pageId` 一经分配不得复用或随文案变化；页面状态统一为：未普查 → 已取证 → 可开工 → 实现中 → 待对照 → 差异修正中 → 已验收。

## 范围口径

- 历史可见基线：`MENU-KB-001`，来自知识库 `02-业务知识库/系统与流程/双引鲸ERP/07-菜单树.md` 的 2026-08-11 页面观察，共 13 个一级菜单、50 个叶子入口。
- 当前账号分母：待 `MENU-CURRENT-001` 只读采集后确定。现阶段所有条目的“历史可见（当前待复核）”不等于 2026-09-14 现网可见结论。
- 知识库存在但本轮现网未显示的条目，采集后改为“当前账号不可见”，不进入当前完成分母；不得删除历史条目或复用其 `pageId`。
- `子页面数`、`状态数` 为已登记数量，`0（待普查）` 表示尚未发现并登记，不表示现网确定没有。

| pageId | 一级菜单 | 二级菜单 | 入口 | 路由 | 页面类型 | 可见性 | 子页面数 | 状态数 | 现网访问 | 证据 | 复刻 | 对照 | 测试 | 验收 | 差异 |
|---|---|---|---|---|---|---|---:|---:|---|---|---|---|---|---|---|
| `home/home` | 首页 | 首页 | 登录后首页 | `/tsHome` | 工作台 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `selection/product-home` | 小竹熊选品 | 选品中心 | 左侧菜单 | `/thProductHome` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `selection/product-selection-vehicle` | 小竹熊选品 | 选品车 | 左侧菜单 | `/thProductSelectionVehicle` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `selection/follow-manu` | 小竹熊选品 | 关注厂商 | 左侧菜单 | `/thFollowManu` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `showroom/sample-selection-management` | 展厅管理 | 择样管理 | 左侧菜单 | `/tsSampleSelectionManagement` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `showroom/booth-management` | 展厅管理 | 摊位管理 | 左侧菜单 | `/tsBoothManagement` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `showroom/product-hall-in-out` | 展厅管理 | 产品进出展 | 左侧菜单 | `/tsProductHallInOut` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `showroom/exhibition-hall-setup` | 展厅管理 | 展厅综合设置 | 左侧菜单 | `/tsExhibitionHallSetup` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `product/product-information` | 产品管理 | 产品资料 | 左侧菜单 | `/tsProductInformation` | 列表/表单 | 历史可见（当前待复核） | 0 | 8 | 2026-09-13 已访问默认首屏 | PI-001；MENU-KB-001 | 实现中 | 待对照 | 21/23（Task 5 待处理） | 未验收 | 已登记，见差异清单 |
| `product/down-products` | 产品管理 | 下架产品 | 左侧菜单 | `/tsDownProducts` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `product/material-data` | 产品管理 | 物料资料 | 左侧菜单 | `/tsMaterialData` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `product/exclusive-products` | 产品管理 | 客户专属 | 左侧菜单 | `/tsExclusiveProducts` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `product/combination-data` | 产品管理 | 组合资料 | 左侧菜单 | `/tsCombinationData` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `product/customer-product` | 产品管理 | 客户产品 | 左侧菜单 | `/tsCustomerProduct` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `manufacturer/manufacturer-management` | 厂商管理 | 厂商资料 | 左侧菜单 | `/tsManufacturerManagement` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `manufacturer/removal-manufacturer` | 厂商管理 | 下架厂商 | 左侧菜单 | `/tsRemovalManufacturer` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `customer/customer-info` | 客户管理 | 客户资料 | 左侧菜单 | `/tsCustomerInfo` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `sales/sales-quotation` | 销售管理 | 销售报价 | 左侧菜单 | `/tsSalesQuotation` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `sales/sales-order` | 销售管理 | 销售订货 | 左侧菜单 | `/tsSalesOrder` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `procurement/procurement-ordering` | 采购管理 | 采购订货 | 左侧菜单 | `/tsProcurementOrdering` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `procurement/material-ordering` | 采购管理 | 物料订货 | 左侧菜单 | `/tsMaterialOrdering` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `procurement/materials-transit` | 采购管理 | 物料在途 | 左侧菜单 | `/tsMaterialsTransit` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `procurement/procurement-transit` | 采购管理 | 采购在途 | 左侧菜单 | `/tsProcurementTransit` | 待普查 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `procurement/await-payment` | 采购管理 | 申请付款 | 左侧菜单 | `/tsAwaitPayment` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `order-tracking/order-tracking` | 跟单管理 | 订单跟踪 | 左侧菜单 | `/tsOrderTracking` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `order-tracking/inspection-order` | 跟单管理 | 收货单 | 左侧菜单 | `/tsInspectionOrder` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `order-tracking/shipping-schedule` | 跟单管理 | 排柜计划 | 左侧菜单 | `/tsShippingSchedule` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `order-tracking/customershipment` | 跟单管理 | 客户发货 | 左侧菜单 | `/tsCustomershipment` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `warehouse/inventory-settings` | 仓库管理 | 产品库位设置 | 左侧菜单 | `/tsInventorySettings` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `warehouse/inventory-inquiry` | 仓库管理 | 库存查询 | 左侧菜单 | `/tsInventoryInquiry` | 查询列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `warehouse/purchase-receiving` | 仓库管理 | 采购入库 | 左侧菜单 | `/tsPurchaseReceiving` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `warehouse/order-shipped` | 仓库管理 | 订单出库 | 左侧菜单 | `/tsOrderShipped` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/customer-account` | 财务管理 | 客户账号 | 左侧菜单 | `/tsCustomerAccount` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/customer-payment` | 财务管理 | 客户收款 | 左侧菜单 | `/tsCustomerPayment` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/customer-receivable` | 财务管理 | 客户应收 | 左侧菜单 | `/tsCustomerReceivable` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/receivable-settlement` | 财务管理 | 应收结算 | 左侧菜单 | `/tsReceivableSettlement` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/manufacture-account` | 财务管理 | 厂商账号 | 左侧菜单 | `/tsManufactureAccount` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/manufacture-payment` | 财务管理 | 厂商付款 | 左侧菜单 | `/tsManufacturePayment` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/manufacture-pay` | 财务管理 | 厂商应付 | 左侧菜单 | `/tsManufacturePay` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `finance/pay-settlement` | 财务管理 | 应付结算 | 左侧菜单 | `/tsPaySettlement` | 单据列表/详情 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `settings/system-settings` | 综合设置 | 系统设置 | 左侧菜单 | `/tsSystemSettings` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `settings/customer-setup` | 综合设置 | 客户设置 | 左侧菜单 | `/tsCustomerSetup` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `settings/product-settings` | 综合设置 | 产品设置 | 左侧菜单 | `/tsProductSettings` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `settings/print-export-template` | 综合设置 | 打印导出模板 | 左侧菜单 | `/tsPrintExportTemplate` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/account-management` | 系统管理 | 用户管理 | 左侧菜单 | `/tsAccountManagement` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/order-tracking-setup` | 系统管理 | 跟单设置 | 左侧菜单 | `/tsOrderTrackingSetup` | 设置页 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/role-management` | 系统管理 | 角色管理 | 左侧菜单 | `/tsRoleManagement` | 管理列表/权限 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/department-management` | 系统管理 | 部门管理 | 左侧菜单 | `/tsDepartmentManagement` | 管理列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/login-log` | 系统管理 | 登录日志 | 左侧菜单 | `/tsLoginLog` | 日志列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |
| `system/operation-log` | 系统管理 | 操作日志 | 左侧菜单 | `/tsOperationLog` | 日志列表 | 历史可见（当前待复核） | 0（待普查） | 0（待普查） | 待本轮访问 | MENU-KB-001 | 未开始 | 未对照 | 未编写 | 未验收 | 待普查 |

## 唯一性与分母

- 历史基线行数：50；唯一 `pageId`：50。
- 当前账号可见分母：待 `MENU-CURRENT-001`，不得以历史基线 50 代替。
- 当前账号不可见数：待 `MENU-CURRENT-001`；确认后保留条目并从当前完成分母排除。
