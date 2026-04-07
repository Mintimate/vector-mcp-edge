# 扩展更多 MCP 工具

参考 [Oh My Rime](https://cnb.cool/Mintimate/rime/DocVitePressOMR) 的实现，你可以为 MCP Server 添加更多工具。

::: tip 本项目示例
本项目的 Go Cloud Function（`cloud-functions/internal/handler/mcp.go`）已实现 4 个工具，涵盖知识库查询（`query_knowledge_base`）、项目概览（`get_project_info`）、快速指南（`get_quickstart`）和方案对比（`get_solutions`），可作为多工具路由分发的参考。

同时，`cloud-functions/internal/handler/tooluse.go` 提供了前端 AI 组件使用的 Tool Use 接口。详见 [本站 MCP 端点](/features/mcp-endpoint)。
:::

## 静态数据工具

对于不需要动态查询的信息（如下载链接、作者信息），可以将文本抽取为独立文件，使用 Go 的 `embed` 包在编译时嵌入：

```go
// 在 handler/ 目录下创建 static/ 子目录存放 .md 文件
//go:embed static/project_info.md
var projectInfoText string

//go:embed static/quickstart.md
var quickstartText string
```

这样文本内容与代码逻辑分离，维护更方便。本项目的 `get_project_info`、`get_quickstart`、`get_solutions` 三个工具就是这样实现的。

如果你使用 JS 实现，也可以直接在代码中定义静态数据：

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

当你的 MCP Server 拥有多个工具时，建议使用 `switch` 进行路由分发。

### Go 版本（当前推荐）

```go
func mcpToolsCall(req mcpRequest, cfg config.Config) map[string]interface{} {
    name, _ := req.Params["name"].(string)
    args, _ := req.Params["arguments"].(map[string]interface{})

    switch name {
    case "query_knowledge_base":
        return mcpQueryKnowledge(req.ID, args, cfg)
    case "get_project_info":
        return mcpOK(req.ID, mcpText(mcpProjectInfoText))
    case "get_quickstart":
        return mcpOK(req.ID, mcpText(mcpQuickstartText))
    default:
        return mcpError(req.ID, -32602, fmt.Sprintf("Unknown tool: %s", name))
    }
}
```

### JS 版本（历史参考）

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
| 静态文本用 embed | Go 中使用 `//go:embed` 将文本文件编译时嵌入，代码更干净 |
