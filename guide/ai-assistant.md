# 配置网页端 AI 助手

本项目已内置网页端 AI 助手聊天组件。Go Cloud Function 部署后已自动提供 RAG 问答和 Tool Use 接口，只需配置前端环境变量即可启用。

::: tip 无需自建服务器
早期 EdgeOne Pages 仅支持 JS Cloud Function，网页端 AI 助手需要[自建 Go 后端服务器](/features/solution-rag)。现在 Go Cloud Function 已内置 RAG + Tool Use 接口，**无需额外部署任何后端服务**。
:::

## 前置条件

- 已完成主线教程（知识库向量化 + Go Cloud Function 部署）
- Go Cloud Function 已正常运行（可通过 `curl https://<你的域名>/api/v1/health` 验证）

## 第一步：确认后端接口可用

Go Cloud Function 部署后，以下接口已自动可用：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/mcp/tools` | GET | 获取工具列表 |
| `/api/v1/mcp/tools/call` | POST | 调用指定工具 |
| `/api/v1/mcp/llm/chat` | POST (SSE) | LLM 流式对话，支持 Tool Calling |

验证接口：

```bash
curl https://<你的域名>/api/v1/mcp/tools
```

如果返回工具列表 JSON，说明后端已就绪。

## 第二步：配置环境变量

### 开发环境

在终端设置环境变量后启动开发服务器：

```bash
export AI_MCP_BASE_URL=http://localhost:9000/api/v1/mcp
yarn dev
```

### 生产环境

在 EdgeOne Pages 项目设置或 CNB 流水线中添加环境变量：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `AI_MCP_BASE_URL` | 是 | Go Cloud Function 的 Tool Use 接口地址 |
| `AI_MAX_HISTORY_TURNS` | 否 | 最大对话历史轮数，默认 `3` |
| `AI_WELCOME_MESSAGE` | 否 | 自定义欢迎消息 |
| `AI_DEFAULT_TOOLS` | 否 | 降级工具定义 JSON |

::: tip 同域部署
由于 Go Cloud Function 和 VitePress 站点部署在同一个 EdgeOne Pages 项目中，`AI_MCP_BASE_URL` 可以直接使用同域地址（如 `https://<你的域名>/api/v1/mcp`），无需额外处理跨域问题。
:::

::: warning 注意
`AI_MCP_BASE_URL` 的值必须以 `/api/v1/mcp` 结尾。前端会在此基础上拼接 `/tools`、`/tools/call`、`/llm/chat`，最终请求路径为：
- `GET /api/v1/mcp/tools`
- `POST /api/v1/mcp/tools/call`
- `POST /api/v1/mcp/llm/chat`
:::

## 第三步：验证

1. 启动 VitePress 开发服务器
2. 在导航栏右侧找到 AI 助手按钮（`AI` 图标）
3. 点击打开聊天窗口，输入问题测试

### 验证清单

- [ ] AI 按钮在导航栏右侧正常显示
- [ ] 点击按钮能打开聊天窗口
- [ ] 发送消息后能收到流式回复
- [ ] 工具调用进度正常显示（分析 → 查询 → 回答）
- [ ] 移动端布局正常

## 组件结构

```
.vitepress/theme/
├── Layout.vue                    # 自定义布局，挂载 AI 助手到导航栏
├── index.ts                      # 主题入口
├── components/
│   └── aiChat/
│       ├── index.vue             # 聊天组件（悬浮按钮 + 窗口 + 拖拽）
│       ├── aiChat.styles.css      # 完整样式
│       └── composables/
│           ├── useChat.js         # 消息管理、历史记录、滚动
│           ├── useToolCall.js     # Tool Use 两轮流程
│           └── useMarkdown.js     # Markdown 渲染
```

## 常见问题

### AI 按钮不显示

检查 `Layout.vue` 是否正确注册为主题 Layout，以及 `import.meta.env.AI_MCP_BASE_URL` 是否被正确注入。

### 发送消息无响应

1. 检查 Go Cloud Function 是否正常运行（`curl /api/v1/health`）
2. 用 `curl` 测试 `GET /api/v1/mcp/tools` 是否返回工具列表
3. 检查浏览器控制台的网络请求是否 404（通常是路径拼接错误）
4. 确认 `AI_MCP_BASE_URL` 以 `/api/v1/mcp` 结尾

### 环境变量不生效

本项目通过 `vite.config.mjs` 的 `define` 机制注入 `AI_` 前缀变量，无需 `VITE_` 前缀。如果修改了环境变量，需要**重启开发服务器**才能生效。

::: details 📜 历史方案：自建 Go 后端
早期 EdgeOne Pages 仅支持 JS Cloud Function，网页端 AI 助手需要自建 Go 后端服务器（[Knowledge Maker](https://github.com/Mintimate/knowledge-maker)）。现在 Go Cloud Function 已完全替代该方案，无需自建服务器。

如果你有特殊需求（如私有化部署、特定网络环境），仍可参考 [场景二：Go RAG 网页助手](/features/solution-rag)（已归档）。
:::

## 相关文档

- [Go Cloud Function 搭建教程](./cloud-function) — 如果你还未完成 Go Cloud Function 部署
- [扩展更多 MCP 工具](./extend-tools) — 为 AI 助手添加更多工具能力
- [本站 MCP 端点](/features/mcp-endpoint) — 了解本站的 MCP 端点配置
