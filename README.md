
# VitePress MCP 智能检索

> 一份教程 + 思路演示（兼具 Demo），展示如何为 VitePress 文档站点赋予 AI 语义搜索能力

📖 **在线文档**：[vector-mcp-edge.mintimate.cn](https://vector-mcp-edge.mintimate.cn/)

## ✨ 项目简介

本项目是一份**教程文档与思路演示**（兼具可运行的 Demo），围绕「如何为 VitePress 文档添加 MCP 智能检索」这一主题，提供从零到一的完整搭建思路与实践参考。

核心思路：通过 [CNB](https://cnb.cool/) 平台完成文档向量化，在腾讯云 **EdgeOne Makers** 中用路径级 Node Cloud Function 提供标准 MCP 端点，并用 Makers 托管 Agent 提供网页端多轮问答。

> **注意**：本项目的重点在于**讲解思路和演示流程**，而非提供一个开箱即用的工具库。你可以参考本项目的方案设计和代码示例，将相同的思路应用到自己的文档站点中。

## 🎯 你能从中学到什么

- **🧠 文档向量化** — 如何利用 CNB 知识库，一行配置实现文档自动分块、Embedding、索引构建
- **⚡ Makers 一体化托管** — 静态站点、路径级 Cloud Function 与 Agent 在同一项目构建部署
- **🤖 托管 Agent** — 使用 OpenAI Agents SDK、Makers AI Gateway、会话存储和 SSE 流式响应
- **🌐 MCP 协议接入** — 如何通过标准化 Model Context Protocol 接口，对接 Cursor、VS Code、Claude Desktop 等主流 AI 工具
- **🤖 网页端 AI 助手** — 浏览器只负责交互，检索编排与多轮记忆由托管 Agent 完成
- **🔀 方案演进对比** — 从浏览器手工 Tool Calling 演进到 Makers 托管 Agent
- **🛠️ 落地实践经验** — 最佳实践、FAQ、故障排查、术语表，覆盖从搭建到维护的常见问题

## 🟢 在线体验

本项目自身就是 Makers 混合方案的真实落地产物，已部署可用的 MCP 端点与网页 Agent：

| 项目 | 说明 |
|------|------|
| **服务地址** | `https://vector-mcp-edge.mintimate.cn/mcp` |
| **传输协议** | Streamable HTTP |
| **协议版本** | `2025-03-26` |

### 快速接入

复制以下配置到你的 AI 工具中，即可立即体验：

**Cursor** (`.cursor/mcp.json`)：
```json
{
  "mcpServers": {
    "vector-mcp-edge-docs": {
      "url": "https://vector-mcp-edge.mintimate.cn/mcp",
      "transport": "streamable-http"
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`)：
```json
{
  "servers": {
    "vector-mcp-edge-docs": {
      "type": "http",
      "url": "https://vector-mcp-edge.mintimate.cn/mcp"
    }
  }
}
```

更多客户端配置请参阅 [在线文档 - MCP 端点](https://vector-mcp-edge.mintimate.cn/features/mcp-endpoint)。

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| [VitePress](https://vitepress.dev/) | 静态文档站点生成 |
| [CNB](https://cnb.cool/) | 代码托管 & 知识库向量化 |
| [EdgeOne Makers](https://edgeone.ai/) | 站点、Cloud Function 与 Agent 托管 |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) | Agent 编排、工具调用与流式运行 |
| Node Cloud Function | 标准 MCP Streamable HTTP 端点 |
| [Slidev](https://sli.dev/) | 演示文稿 |
| [Mermaid](https://mermaid.js.org/) | 架构图 & 流程图渲染 |

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- npm
- Go >= 1.24（用于本地开发 Cloud Function）

### 本地开发

```bash
# 克隆仓库
git clone https://cnb.cool/shenzhen/lecturer/vector-mcp-edge.git
cd vector-mcp-edge

# 安装依赖（会自动安装 slides 子项目依赖）
npm install

# 启动 Makers 本地代理（包含站点、Agent 与 Cloud Function）
npm run dev:makers
```

### 构建产物

```bash
# 构建文档站点（含演示文稿）
npm run build
```

构建产物输出到 `.vitepress/dist` 目录。

### 本地预览

```bash
npm run preview
```

## 📁 项目结构

```
vector-mcp-edge/
├── .cnb.yml                  # CNB 平台 CI/CD 配置（向量化 + 同步 + 部署）
├── .vitepress/
│   ├── config.mts            # VitePress 站点配置
│   └── theme/                # 自定义主题与样式
├── agents/                   # Makers 托管 Agent（聊天、会话、SSE、停止）
│   ├── chat/                 # POST /chat：知识库问答 Agent
│   ├── stop/                 # POST /stop：终止运行中的会话
│   ├── _model.ts             # AI Gateway 模型适配
│   └── _shared.ts            # SSE 与响应工具
├── cloud-functions/          # 路径级 Node Cloud Functions
│   ├── mcp.js                # /mcp：标准 MCP + CNB 知识库工具
│   └── api/v1/health.js      # /api/v1/health
├── guide/                    # 搭建教程文档
│   ├── getting-started.md    # 快速开始
│   ├── deploy-cnb.md         # 托管到 CNB
│   ├── knowledge-base.md     # 知识库向量化
│   ├── cloud-function.md     # Makers Cloud Function + Agent（推荐）
│   ├── deploy-verify.md      # 部署与验证
│   ├── ai-assistant.md       # 配置网页端 AI 助手
│   ├── extend-tools.md       # 扩展更多 MCP 工具
│   ├── mcp-server.md         # JS Edge Function（已归档）
│   └── ...                   # 最佳实践、FAQ、故障排查、术语表
├── features/                 # 功能与效果文档
│   ├── solutions.md          # 方案演进与对比
│   ├── architecture.md       # 架构全景图
│   ├── solution-go-function.md  # Makers 托管方案详情
│   ├── mcp-endpoint.md       # 本站 MCP 端点（Live Demo）
│   ├── slides.md             # 演示文稿入口
│   ├── solution-mcp.md       # JS Serverless MCP（已归档）
│   └── solution-rag.md       # Go RAG 自建服务（已归档）
├── slides/                   # Slidev 演示文稿
│   ├── slides.md             # 演示文稿内容
│   └── package.json          # Slidev 依赖
├── public/                   # 静态资源
├── edgeone.json              # EdgeOne Makers 与 Agent 框架配置
├── index.md                  # 站点首页
├── package.json              # 项目依赖配置
└── LICENSE                   # MIT 开源协议
```

## 🚢 部署

### CNB 自动部署

项目已配置 `.cnb.yml`，推送到 CNB 平台后会自动触发：

1. **知识库向量化** — 自动扫描所有 Markdown 文件，构建向量索引
2. **代码同步** — 自动同步到 GitHub 镜像仓库
3. **Makers 部署** — 同时发布 VitePress、路径级 Node Cloud Function 与托管 Agent

### 手动部署到 EdgeOne Makers

```bash
npm run deploy:makers -- -n vector-mcp-edge
```

## 📖 文档导航

完整文档请访问 👉 [vector-mcp-edge.mintimate.cn](https://vector-mcp-edge.mintimate.cn/)

- **[上手体验](https://vector-mcp-edge.mintimate.cn/features/)** — 方案对比、架构设计、在线 Demo
- **[搭建教程](https://vector-mcp-edge.mintimate.cn/guide/)** — 从零开始，一步步搭建 MCP 智能检索
- **[MCP 端点](https://vector-mcp-edge.mintimate.cn/features/mcp-endpoint)** — 复制配置即可在 AI 编辑器中体验
- **[演示文稿](https://vector-mcp-edge.mintimate.cn/slides/)** — 项目介绍 Slides

## 🤝 适合谁

- 想为自己的文档站点添加 AI 语义搜索能力的开发者
- 对 MCP 协议、向量检索、边缘函数感兴趣的技术爱好者
- 希望了解 CNB + EdgeOne 生态实践的同学

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。
