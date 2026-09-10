---
title: 系统浏览全字段截图
type: automation_guide
updated: 2026-08-04
---

# 系统浏览全字段截图

本工具用于有登录态的系统调研，不负责登录，也不会写入账号、密码、验证码或会话凭据。

## 证据原则

- 实际可见的菜单、页签、查询条件、按钮、表头、固定列、操作列、分页和已展开表单字段均须采集。
- 普通页面使用 `fullPage`；内部滚动表格/表单按纵向、横向位置逐段读取。
- 分片仅存在内存中，最终输出一张带视图标记的纵向合图 PNG；其 `capture-manifest.json` 保存字段集合、滚动位置、哈希和校验结果。
- 虚拟表格只覆盖完整表头、当前可见记录行和分页区，不以遍历全部记录行冒充字段采集。
- 最终图片写入前遮挡登录身份区域。业务数据仍按内部资料权限管理。
- 采集前会校验 DOM 坐标与截图像素画布；两者不一致或裁切区超出画布时，任务必须失败并删除该次合图，不能以缩小、截断或猜测方式继续。

## Token 节流

- 浏览器及本地代码完成滚动、合图、字段去重和完整性校验；模型只读取 manifest 摘要。
- 每个模块只提炼一次。只有 `validation.passed=false`、加载异常或 manifest 字段变化时才安排追加审阅。
- `type: system_browsing_raw` / `auto_digest: false` 的 Raw 主记录不会被 `raw-pipeline.mjs` 自动再次消化。

## 调用边界

在 Browser 插件接管、且用户已经登录的标签页中调用 `全字段截图器.mjs`。调用方先用只读 DOM 快照定位滚动容器，再以 `captureScrollable` 采集；每次采集完成必须写 manifest 并执行 `validateManifest`。

结果目录建议按菜单路径存放在 Raw 附件下：

```text
附件/<Raw主记录>/<菜单路径>/<页面>全字段合图.png
附件/<Raw主记录>/<菜单路径>/capture-manifest.json
```

`capture-manifest.json` 是字段完整性的权威证据；知识页只引用最终合图和 manifest，不复制临时分片。
