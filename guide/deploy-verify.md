# 部署与验证

## 推送代码触发部署

```bash
git add .
git commit -m "feat: add MCP search with knowledge base"
git push origin main
```

推送后，CNB 流水线会自动执行：

1. **向量化数据**：扫描所有 `.md` 文件，进行分块和向量化
2. **构建并部署**：将 VitePress、路径级 Node Cloud Function 与托管 Agent 部署到 EdgeOne Makers

::: tip 全自动流程
你只需要 `git push`，知识库更新、站点构建、MCP 与 Agent 部署全部自动完成。
:::

## 验证 MCP Server

部署完成后，你的 MCP Server 地址为：

```
https://<你的域名>/mcp
```

### 测试 GET（服务发现）

```bash
curl https://<你的域名>/mcp
```

预期返回：

```json
{
  "name": "my-docs-mcp",
  "version": "1.0.0",
  "protocolVersion": "2025-03-26",
  "availableTools": [
    { "name": "query_knowledge_base", "description": "Search the documentation..." }
  ]
}
```

### 测试工具调用

```bash
curl -X POST https://<你的域名>/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query_knowledge_base",
      "arguments": { "query": "如何快速开始", "top_k": 3 }
    }
  }'
```

## 发布后建议检查项

- MCP 地址是否可公网访问
- `tools/list` 是否返回预期工具
- 知识库查询结果是否覆盖最新文档
- `/chat` 是否返回 `text/event-stream`
- 同一 `makers-conversation-id` 的第二轮提问是否能继承上下文
- `/stop` 是否能用相同的 body/header conversation ID 中止运行

## 验证托管 Agent

```bash
CONVERSATION_ID=$(uuidgen)
curl -N https://<你的域名>/chat \
  -H 'Content-Type: application/json' \
  -H "makers-conversation-id: $CONVERSATION_ID" \
  -d '{"message":"这个项目的 MCP 如何部署？"}'
```

响应应包含 `tool_call`、`tool_result`、`ai_response` 和最终的 `[DONE]`。当前模型支持并开启思考时，还应包含 `reasoning` 事件。

停止运行：

```bash
curl -X POST https://<你的域名>/stop \
  -H 'Content-Type: application/json' \
  -H "makers-conversation-id: $CONVERSATION_ID" \
  -d "{\"conversation_id\":\"$CONVERSATION_ID\"}"
```

::: tip 本站即最佳示例
本项目自身就内置了一个可用的 MCP 端点（`https://vector-mcp-edge.mintimate.cn/mcp`），提供了 4 个工具。你可以将其作为参考，查看 [本站 MCP 端点](/features/mcp-endpoint) 了解详情并用 `curl` 验证。
:::

## 相关文档

进入维护与优化：

- [常见问题 FAQ](./faq.md)
- [故障排查](./troubleshooting.md)
- [最佳实践](./best-practices.md)

如果你想了解不同的集成方案，请查看顶部的 **功能/效果** 标签页。
