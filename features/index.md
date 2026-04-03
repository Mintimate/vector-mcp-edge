# Vector MCP Edge

欢迎来到 `vector-mcp-edge` 项目的功能与效果展示区。这里主要介绍本项目的架构设计以及两种不同的应用场景。

## 这个是什么?

其实项目是一个工作流，将 VitePress 或者任何 Markdown 文档项目部署在 [CNB](https://cnb.cool/)，并激活 CNB 的知识库流水线在 Git 推送时自动触发知识库构建，把相关文件向量化。

基于 CNB 的知识库向量接口，本项目提供了**两种应用场景**：

1. **[场景一：Serverless MCP](./solution-mcp)**（重点）— 使用 EdgeOne Pages 的 Cloud Function 实现 MCP Server，让 Cursor、Claude 等外部 AI 工具直接检索你的文档，全程 Serverless，零服务器成本。
2. **[场景二：Go RAG 网页助手](./solution-rag)**（进阶）— 自建 Go 后端服务，将 AI 问答能力直接嵌入 VitePress 前端，网站访客无需安装任何工具即可体验。

![What's This?](./assets/what-is-this.webp)

两种场景共享同一份 CNB 知识库数据源，可以独立使用，也可以同时部署。

## 在线体验

本项目自身就是场景一的真实落地产物——我们已经部署了一个可用的 MCP 端点，你可以立即接入体验：

- [本站 MCP 端点（Live Demo）](./mcp-endpoint) — 复制配置即可在 AI 编辑器中使用

Go RAG 页面助手，你也可以在本站的右上角找到入口:

![Go RAG 页面助手](./assets/go-rag.webp)

## 了解更多

- [方案对比与选型](./solutions) — 一张表看懂两种场景的差异，快速选择最适合你的落地方式
- [架构全景图](./architecture) — 从全局视角理解项目的整体架构和数据流向

## 下一步

了解完功能与效果后，你可以前往 [搭建教程](../guide/) 开始动手实践。
