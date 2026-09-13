# 公共组件（现网复刻原型-豆包）

本目录是贸易端现网复刻原型的**唯一公共实现**：纯静态 HTML/CSS/JS，无框架、无 CDN、无构建，`file://` 双击即可运行。所有页面共用同一套 `app.css` + `app.js`，禁止每页复制一套侧栏。

## 文件

| 文件 | 职责 |
|---|---|
| `app.css` | 设计 token、全局壳（侧栏/顶栏/页签）、全部公共组件样式（按钮/输入/下拉/表格/分页/弹窗/抽屉/确认框/下拉菜单/toast）。数值按 2026-09-10 现网计算样式校准 |
| `app.js` | 现网菜单树、`mountShell` 壳渲染、侧栏折叠/菜单过滤、多页签（sessionStorage）、自定义 select、下拉菜单、确认框、弹窗/抽屉、toast |
| `assets/logo.png` | 现网白色横版 logo（深色侧栏专用，下载自 trade.tsbsoft.com/logo.png） |
| `snippets/` | 可复制结构片段 01～12，与 `03-产品工作/设计规范/双引鲸/组件/snippets/` **双写一致**，改一处必须同步另一处 |

## 页面如何引用

```html
<body>
  <div id="page-content"><!-- 本页全部内容（含弹层，必须都在这个容器里） --></div>
  <script>window.DYJ_ROOT = '../../';</script>
  <script src="../../组件/app.js"></script>
  <script>
    DYJ.mountShell({ active: '产品资料', tab: { name: '产品资料', path: location.href } });
    DYJ.bindSelects(); DYJ.bindClose();
  </script>
</body>
```

- `DYJ.mountShell({active, tab})`：渲染壳并把 `#page-content` 整体搬进主区；**页面内所有弹窗/抽屉必须放在 `#page-content` 内**，否则会被壳替换丢弃。
- `DYJ.bindSelects(root?)`：把 `.el-select` 变成可点下拉（readonly input + `.el-select__caret` + `data-options="a,b,c"`）。
- `DYJ.bindClose()`：绑定 `[data-close-dialog]` / `[data-close-drawer]` 与遮罩点击关闭。
- `DYJ.openDialog/closeDialog`、`DYJ.openDrawer/closeDrawer`：弹层显隐（抽屉需要 `id` 与 `id+Mask` 成对）。
- `DYJ.confirmBox({title, content, okText, type})`：Promise<boolean> 二次确认。
- `DYJ.openContextMenu(anchor, [{label,danger,onClick}])`：固定定位下拉菜单。
- `DYJ.toast(msg)`：顶部轻提示。

## 公共 vs 特有

**公共（两页及以上复用，已抽入 app.css/app.js 并双写片段）**：全局壳、状态页签、快捷查询条、工具条与圆形图标簇、数据表、分页、综合查询抽屉、宽表单弹窗、列设置抽屉、确认框、下拉菜单、select、toast、多页签。

**特有（仅产品资料模块，写在该页目录，不进公共库）**：

- 图搜浮层（706px，粘贴网址/上传/粘贴三卡）——`页面/产品管理-产品资料/index.html` 内联样式与结构，片段 08 仅作结构留档。
- 行「更多」业务项（客户产品/加入选品车/留痕记录/货柜箱/尺计算）。
- 工具条「选品车」弹窗、更多操作各批量层（仅产品资料页）。
- 导入产品页（独立路由形态，非弹窗）——片段 11 留档。

## 片段索引（snippets/）

01 全局壳 · 02 状态页签与快捷查询 · 03 工具条 · 04 数据表格 · 05 分页 · 06 综合查询抽屉 · 07 新建/编辑宽弹窗 · 08 图搜浮层 · 09 列设置抽屉 · 10 确认框 · 11 导入产品页 · 12 首页工作台。

## 约束

- 图标一律内联线性 SVG，禁止 emoji；演示数据必须明显虚构，禁止下载真实产品图（图片列用灰底文字占位）。
- 禁止调现网写接口；确定/保存/删除只改本地静态数据并给提示。
