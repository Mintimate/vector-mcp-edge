
# VitePress MCP 智能检索

> 一份教程 + 思路演示（兼具 Demo），展示如何为 VitePress 文档站点赋予 AI 语义搜索能力

## ✨ 项目简介

本项目是一份**教程文档与思路演示**（兼具可运行的 Demo），围绕「如何为 VitePress 文档添加 MCP 智能检索」这一主题，提供从零到一的完整搭建思路与实践参考。

核心思路：通过 CNB 平台的知识库能力实现文档向量化，结合腾讯云 EdgeOne Edge Function 在边缘部署 MCP Server，让 AI 助手能够语义化检索你的文档内容。

> **注意**：本项目的重点在于**讲解思路和演示流程**，而非提供一个开箱即用的工具库。你可以参考本项目的方案设计和代码示例，将相同的思路应用到自己的文档站点中。

## 🎯 你能从中学到什么

- **🧠 文档向量化** — 如何利用 CNB 知识库，一行配置实现文档自动分块、Embedding、索引构建
- **⚡ 边缘部署 MCP Server** — 如何在 EdgeOne Edge Function 中实现 MCP Server，零服务器成本、全球加速
- **🌐 MCP 协议接入** — 如何通过标准化 Model Context Protocol 接口，对接各类主流 AI 助手与大模型平台
- **🔀 两套方案对比** — 方案一（MCP）用于外部 AI 工具接入；方案二（RAG）用于网页端 Go 服务问答，帮你选型
- **🛠️ 落地实践经验** — 最佳实践、FAQ、故障排查、术语表，覆盖从搭建到维护的常见问题

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| [VitePress](https://vitepress.dev/) | 静态文档站点生成 |
| [CNB](https://cnb.cool/) | 代码托管 & 知识库向量化 |
| [EdgeOne Edge Function](https://cloud.tencent.com/product/eo) | 边缘函数部署 MCP Server |
| [Mermaid](https://mermaid.js.org/) | 架构图 & 流程图渲染 |

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- npm

### 本地开发

```bash
# 克隆仓库
git clone https://cnb.cool/shenzhen/lecturer/vector-mcp-edge.git
cd vector-mcp-edge

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建产物

```bash
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
├── .cnb.yml                # CNB 平台 CI/CD 配置
├── .vitepress/
│   ├── config.mts          # VitePress 站点配置
│   └── theme/              # 自定义主题与样式
├── guide/                  # 搭建教程文档
│   ├── getting-started.md  # 快速开始
│   ├── deploy-cnb.md       # 托管到 CNB
│   ├── knowledge-base.md   # 知识库向量化
│   ├── mcp-server.md       # Edge Function 实现 MCP Server
│   ├── deploy-verify.md    # 部署与验证
│   ├── extend-tools.md     # 扩展更多 MCP 工具
│   ├── best-practices.md   # 最佳实践
│   ├── faq.md              # 常见问题
│   ├── troubleshooting.md  # 故障排查
│   └── glossary.md         # 术语表
├── features/               # 功能与效果文档
│   ├── solutions.md        # 方案对比与选型
│   ├── architecture.md     # 架构全景图
│   ├── solution-mcp.md     # 方案一：接入外部 AI 工具
│   └── solution-rag.md     # 方案二：自建 Go 服务 RAG
├── public/                 # 静态资源
│   ├── favicon.ico         # 站点图标
│   └── favicon.svg         # 项目 Logo / Favicon
├── edgeone.json            # EdgeOne Pages 部署配置
├── index.md                # 站点首页
├── package.json            # 项目依赖配置
└── LICENSE                 # MIT 开源协议
```

## 🚢 部署

### CNB 自动部署

项目已配置 `.cnb.yml`，推送到 CNB 平台后会自动触发：

1. **知识库向量化** — 自动扫描所有 Markdown 文件，构建向量索引
2. **代码同步** — 自动同步到 GitHub 镜像仓库
3. **站点部署** — 构建 VitePress 产物并部署到 EdgeOne Pages

### 手动部署到 EdgeOne Pages

```bash
npm run build
# 使用 EdgeOne CLI 部署 .vitepress/dist 目录
```

## 📖 文档导航

- **[搭建教程](/guide/)** — 从零开始，一步步了解 MCP 智能检索的搭建思路
- **[功能与效果](/features/)** — 两套方案的对比、架构设计与效果演示

## 🤝 适合谁

- 想为自己的文档站点添加 AI 语义搜索能力的开发者
- 对 MCP 协议、向量检索、边缘函数感兴趣的技术爱好者
- 希望了解 CNB + EdgeOne 生态实践的同学

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。
