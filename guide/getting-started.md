# 快速开始

本教程的前提是：**你已经有一个 VitePress（或其他 Markdown）文档项目**。接下来，我们要做的是把它托管到 CNB，激活知识库向量化，然后通过 EdgeOne Cloud Function 暴露 MCP 端点——让 AI 工具能直接检索你的文档。

> 💡 如果你还没有 VitePress 项目，可以参考 [VitePress 官方文档](https://vitepress.dev/zh/guide/getting-started) 快速创建一个。

## 这份教程适合谁？

- **文档维护者**：希望给已有的 VitePress 文档站增加 AI 语义检索能力
- **开发者工具用户**：希望在 Cursor / Claude Desktop / VS Code 中直接检索文档
- **站点建设者**：希望在网页端集成 AI 聊天助手（进阶，见 [场景二](../features/solution-rag)）

## 前置条件

| 条件 | 说明 |
|------|------|
| **已有 VitePress 项目** | 本地能正常 `npm run dev` 启动 |
| **CNB 账号** | 访问 [cnb.cool](https://cnb.cool) 注册账号和组织 |
| **Node.js >= 18** | 推荐 22 LTS |

## 你将完成什么？

![你能得到什么？](./assets/what-you-get.webp)

跟着主线教程走完，你会得到：

1. ✅ 文档项目托管在 CNB，Git 推送自动触发知识库向量化
2. ✅ 一个可用的 MCP Server 端点，部署在 EdgeOne Pages Cloud Function 上
3. ✅ AI 工具（Cursor、Claude 等）可以直接检索你的文档内容

整个过程大约 **20 分钟**：

- **第 5 分钟**：项目托管到 CNB，流水线配置完成
- **第 15 分钟**：CNB 知识库向量化跑通，文档已建立索引
- **第 20 分钟**：MCP Server 部署完成，`curl` 可测试调用并返回结果

## 扩展部分：网页端 AI 助手（进阶）

如果你希望在文档网站内直接嵌入一个 AI 问答助手（如本站右上角的聊天按钮），让访客无需安装任何工具即可体验，可以参考 **[场景二：Go RAG 网页助手](../features/solution-rag.md)**。

实现该进阶功能的前置条件：

- **服务器环境**：需要一台服务器来部署 Go 后端服务（推荐使用 Docker，可直接拉取 CNB 的 Docker 托管镜像）。
- **LLM API**：需要一个支持 Tool Calling 的大模型 API（如 DeepSeek、腾讯混元等），你也可以直接使用 CNB 提供的 LLM API。配合 CNB 的知识库向量检索，实现 RAG 网页助手。
- **前端组件**：本项目已内置了完整的 Vue 聊天组件，只需配置后端接口地址即可启用。

> 💡 **建议**：先完成主线教程（场景一：Serverless MCP），跑通知识库向量化流程后，再按需探索进阶的 RAG 方案。

## 主线教程

按顺序完成以下步骤：

1. **[托管到 CNB](./deploy-cnb.md)** — 将项目推送到 CNB 平台
2. **[知识库向量化](./knowledge-base.md)** — 配置流水线，自动将 Markdown 分块并向量化
3. **[Edge Function 实现 MCP Server](./mcp-server.md)** — 编写 Cloud Function，暴露 MCP 协议端点
4. **[部署与验证](./deploy-verify.md)** — 部署到 EdgeOne Pages，验证端到端可用

## 常见起步问题

- **我的项目不是 VitePress 怎么办？** — 只要是 Markdown 文档项目，CNB 知识库都支持向量化，流程一样
- **我还没有 CNB 账号** — 访问 [cnb.cool](https://cnb.cool) 注册，支持微信/GitHub 登录
- **我想先看看效果再动手** — 前往 [本站 MCP 端点（Live Demo）](../features/mcp-endpoint) 直接体验

## 下一步

准备好了？开始第一步 👉 [托管到 CNB 平台](./deploy-cnb.md)
