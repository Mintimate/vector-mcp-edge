
# VitePress MCP 智能检索

> 为 VitePress 文档站点赋予 AI 语义搜索能力 —— 基于 CNB 平台知识库 + 腾讯云 EdgeOne Edge Function

## ✨ 项目简介

本项目是一套完整的教程文档站点，演示如何为 VitePress 文档添加 **MCP（Model Context Protocol）智能检索**功能。通过 CNB 平台的知识库能力实现文档向量化，结合腾讯云 EdgeOne Edge Function 部署 MCP Server，让 AI 助手能够语义化检索你的文档内容。

## 🎯 核心特性

- **🧠 CNB 知识库** — 一行配置实现文档向量化，push 即触发，自动分块、Embedding、索引构建
- **⚡ EdgeOne Edge Function** — 在边缘函数中实现 MCP Server，零服务器成本、全球加速、自动部署
- **🌐 MCP 协议支持** — 标准化 Model Context Protocol 接口，无缝对接各类主流 AI 助手与大模型平台
- **🔀 两套方案** — 方案一（MCP）用于外部 AI 工具接入；方案二（RAG）用于网页端 Go 服务问答
- **🛠️ 运维齐全** — 覆盖最佳实践、FAQ、故障排查、术语表，从落地到维护的全流程

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
│   └── logo.svg            # 项目 Logo
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

- **[搭建教程](/guide/)** — 从零开始，一步步完成 MCP 智能检索的搭建
- **[功能与效果](/features/)** — 了解两套方案的对比、架构设计与实际效果

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。
