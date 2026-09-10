# Agent 聊天手动导入

无法自动抓取的其他 Agent 会话，请导出为 Markdown 后放入本目录（不要改本 README）。

建议文件名：`YYYY-MM-DD-Agent聊天-来源-主题.md`

文件开头建议包含 YAML：

```yaml
---
date: YYYY-MM-DD
type: Agent聊天
agent: 其他
status: 手动导入
---
```

放入后由 `raw-pipeline` 自动进入消化队列。本目录下的 `README.md` 不会被索引。
