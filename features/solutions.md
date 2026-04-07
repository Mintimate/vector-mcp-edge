# 方案演进与对比

本项目基于 CNB 知识库的向量化流水线，当前推荐使用 **Go Cloud Function** 方案。本页介绍方案的演进历史和各方案的对比。

## 演进背景

由于 EdgeOne Pages 早期**仅支持 JS Cloud Function**，无法在边缘函数中运行 Go 代码，因此本项目最初将功能拆分为两种独立方案：

- **场景一（JS Serverless MCP）**：用 JS 边缘函数实现 MCP Server，仅提供外部 AI 工具检索能力
- **场景二（Go RAG 自建服务）**：需要自建 Go 服务器，提供网页端 AI 问答

2026 年 4 月，EdgeOne Pages 新增了 **Go Cloud Function** 支持，我们将两种方案合并升级为当前的 Go Cloud Function 方案，一个服务同时覆盖 MCP + RAG + Tool Use。

## 演进路径

```mermaid
flowchart TD
    K["📄 Markdown 文档"] --> V["🔄 CNB 流水线<br/>向量化"]
    V --> DB["🗄️ CNB 知识库"]

    DB --> OLD{"⚠️ 早期：EdgeOne 仅支持 JS"}
    OLD -->|仅 MCP 端点| A["📦 场景一：JS Serverless MCP<br/>（已归档）"]
    OLD -->|仅网页 AI 助手<br/>需自建服务器| B["📦 场景二：Go RAG 自建服务<br/>（已归档）"]

    DB --> NEW{"✅ 现在：EdgeOne 支持 Go"}
    NEW -->|MCP + RAG + Tool Use<br/>零运维| C["⭐ Go Cloud Function<br/>（当前推荐）"]

    A -.->|合并升级| C
    B -.->|合并升级| C

    style K fill:#f3e5f5,stroke:#7b1fa2
    style V fill:#fff3e0,stroke:#f57c00
    style DB fill:#e8f5e9,stroke:#388e3c
    style OLD fill:#ffcdd2,stroke:#e53935
    style NEW fill:#c8e6c9,stroke:#2e7d32
    style A fill:#eeeeee,stroke:#9e9e9e,stroke-dasharray: 5 5
    style B fill:#eeeeee,stroke:#9e9e9e,stroke-dasharray: 5 5
    style C fill:#fff3e0,stroke:#ff6f00
```

## 方案对比表

| | 场景一：JS Serverless MCP | 场景二：Go RAG 自建服务 | Go Cloud Function（当前） |
|------|------------------------|-------------------------------|----------------------------|
| **状态** | ⚠️ 已归档 | ⚠️ 已归档 | ✅ **当前推荐** |
| **定位** | 仅外部 AI 工具检索 | 仅网页端 AI 问答 | MCP + 网页端 AI 问答 |
| **运行环境** | EdgeOne JS Function | 自建服务器 | EdgeOne Go Function |
| **LLM 调用** | 由外部工具自带 | Go 后端调用 | Go Function 调用 |
| **服务器** | 无（边缘函数） | 需自建 | 无（边缘函数） |
| **MCP 端点** | ✅ | ❌ | ✅ |
| **网页 AI 助手** | ❌ | ✅ | ✅ |
| **运维复杂度** | 低 | 中 ~ 高 | 低 |
| **共同基础** | CNB 知识库向量接口 | CNB 知识库向量接口 | CNB 知识库向量接口 |

## 当前推荐：Go Cloud Function

Go Cloud Function 是场景一和场景二的**合并升级版**，一个服务同时提供：

- ✅ 标准 MCP 端点（替代场景一）
- ✅ 网页端 AI 助手（替代场景二）
- ✅ 零服务器、零运维
- ✅ 全球 CDN 加速

👉 [前往 Go Cloud Function 方案详情](./solution-go-function)

## 历史方案（已归档）

以下方案为早期 EdgeOne Pages 仅支持 JS 时的实现，现已被 Go Cloud Function 完全替代。保留文档仅供参考。

### 场景一：JS Serverless MCP（已归档）

- 主要面向**开发者**用户
- 希望用户通过 Cursor、Claude Desktop 等 AI 工具检索文档
- 追求**零运维**、零服务器成本
- 仅提供 MCP 端点，不支持网页端 AI 助手
- 已被 Go Cloud Function 的 `/mcp` 路由完全替代

👉 [查看场景一历史文档](./solution-mcp)

### 场景二：Go RAG 自建服务（已归档）

- 需要自建服务器，运维成本较高
- 已被 Go Cloud Function 的 RAG + Tool Use 接口完全替代

👉 [查看场景二历史文档](./solution-rag)

## 在线体验

本项目已使用 Go Cloud Function 部署，MCP 端点和网页端 AI 助手均已上线：

🟢 [本站 MCP 端点（Live Demo）](./mcp-endpoint) — 复制配置即可在 AI 编辑器中体验

## 建议

1. **新项目**：直接使用 Go Cloud Function 方案，无需考虑历史方案
2. **已使用场景一**：建议迁移到 Go Cloud Function，同时获得网页端 AI 助手能力
3. **已使用场景二**：建议迁移到 Go Cloud Function，可以下掉自建服务器
4. 所有方案共享 CNB 知识库，统一维护文档数据源

## 延伸阅读

- [架构全景图](./architecture)
- 博客文章：[将 VitePress 文档数据向量化，配合 RAG 实现 AI 助手插件](https://www.mintimate.cn/2025/08/24/knowledgeRagCnb/)
- Go 后端开源项目：[Knowledge Maker](https://cnb.cool/Mintimate/tool-forge/knowledge-maker)
- Go Cloud Function 教程：[Go Cloud Function 搭建教程](/guide/cloud-function)
