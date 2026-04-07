# VitePress MCP 智能检索

为 VitePress 文档站点添加 MCP 智能语义搜索能力，基于 CNB 知识库 + EdgeOne Go Cloud Function 实现。

## 技术栈

- **VitePress**: 静态文档站点生成框架
- **CNB 知识库**: 文档向量化存储与语义检索 API
- **EdgeOne Go Cloud Function**: 腾讯云边缘函数，零服务器成本运行 MCP Server + RAG 问答 + Tool Use
- **MCP 协议**: Model Context Protocol，标准化 AI 工具接口

## 核心功能

- **一条主线学完**: 从 VitePress 初始化、CNB 托管、知识库向量化到 Go Cloud Function 部署验证，按主线教程一步步完成。
- **一体化方案**: Go Cloud Function 同时提供 MCP 端点和网页端 AI 助手，无需分开部署。
- **CNB 知识库**: 一行配置实现文档向量化，无需自建向量数据库。push 即触发，自动分块、Embedding、索引构建。
- **EdgeOne Go Cloud Function**: 在边缘函数中实现 MCP Server + RAG + Tool Use，零服务器成本、全球加速、自动部署，真正的零运维体验。
- **MCP 协议支持**: 标准化 Model Context Protocol 接口，无缝对接各类主流 AI 助手与大模型平台。

## 项目链接

- 代码仓库: https://cnb.cool/shenzhen/lecturer/vector-mcp-edge
- 在线文档: https://vector-mcp-edge.mintimate.cn
