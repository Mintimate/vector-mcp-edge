# 部署与验证

## 推送代码触发部署

```bash
git add .
git commit -m "feat: add MCP search with knowledge base"
git push origin main
```

推送后，CNB 流水线会自动执行：

1. **向量化数据**：扫描所有 `.md` 文件，进行分块和向量化
2. **构建并部署**：构建 VitePress 站点并部署到 EdgeOne Pages

::: tip 全自动流程
你只需要 `git push`，知识库更新、站点构建、MCP Server 部署全部自动完成。
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
- CORS 与鉴权头是否正确

::: tip 本站即最佳示例
本项目自身就内置了一个可用的 MCP 端点（`https://vector-mcp-edge.mintimate.cn/mcp`），提供了 4 个工具。你可以将其作为参考，查看 [本站 MCP 端点](/features/mcp-endpoint) 了解详情并用 `curl` 验证。
:::

## 相关文档

进入维护与优化：

- [常见问题 FAQ](./faq.md)
- [故障排查](./troubleshooting.md)
- [最佳实践](./best-practices.md)

如果你想了解不同的集成方案，请查看顶部的 **功能/效果** 标签页。
