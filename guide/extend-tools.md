# 扩展更多 MCP 工具

参考 [Oh My Rime](https://cnb.cool/Mintimate/rime/DocVitePressOMR) 的实现，你可以为 MCP Server 添加更多工具。

::: tip 本项目示例
本项目自身的 `cloud-functions/mcp/index.js` 已实现 4 个工具，涵盖知识库查询（`query_knowledge_base`）、项目概览（`get_project_info`）、快速指南（`get_quickstart`）和方案对比（`get_solutions`），可作为多工具路由分发的参考。详见 [本站 MCP 端点](/features/mcp-endpoint)。
:::

## 静态数据工具

对于不需要动态查询的信息（如下载链接、作者信息），可以直接在代码中定义静态数据：

```javascript
const DOWNLOAD_LINKS = {
  "my-app": {
    name: "My App",
    github: "https://github.com/xxx/my-app",
    mirror: "https://cnb.cool/xxx/my-app/-/releases/download/latest/my-app.zip",
    description: "应用程序安装包",
  },
};
```

## 多工具路由分发

当你的 MCP Server 拥有多个工具时，建议使用 `switch` 进行路由分发：

```javascript
async function handleToolsCall(request) {
  const { name, arguments: args } = request.params;
  switch (name) {
    case "query_knowledge_base":
      return await handleQueryTool(request.id, args);
    case "get_download_links":
      return handleDownloadLinksTool(request.id, args);
    case "get_author_info":
      return handleAuthorInfoTool(request.id);
    default:
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: { code: -32602, message: `Unknown tool: ${name}` }
      };
  }
}
```

## 工具设计建议

| 建议 | 说明 |
|------|------|
| 工具名称要有意义 | AI 根据名称和描述决定何时调用 |
| 描述要详细 | 用英文撰写，说明工具的用途和使用场景 |
| 参数要有约束 | 使用 `enum`、`required` 等限制输入 |
| 返回格式化文本 | 使用 Markdown 格式，方便 AI 理解和展示 |
