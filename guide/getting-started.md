# 快速开始

本教程将带你从零开始，为 VitePress 文档站点添加 MCP 智能检索功能。

## 这份文档适合谁？

- **文档维护者**：希望给 VitePress 文档站增加 AI 语义检索能力
- **开发者工具用户**：希望在 Cursor / Claude Desktop / VS Code 中直接检索文档
- **站点建设者**：希望在网页端集成 AI 聊天助手（进阶）

## 前置条件

- **Node.js** >= 18（推荐 22 LTS）
- **包管理器**：npm / yarn / pnpm 任选
- **CNB 账号**：访问 [cnb.cool](https://cnb.cool) 注册

## 推荐学习路径

1. 先走完主线教程：托管 → 向量化 → MCP Server → 部署验证
2. 如果你想了解背后的架构和方案选型，请查看顶部的 **功能/效果** 标签页。

## 30 分钟里程碑

- **第 10 分钟**：本地 VitePress 启动成功
- **第 20 分钟**：CNB 流水线可自动向量化 Markdown
- **第 30 分钟**：MCP Server 可通过 `curl` 调用并返回结果

## 初始化 VitePress 项目

```bash
# 创建项目目录
mkdir my-docs && cd my-docs

# 初始化 package.json
npm init -y

# 安装 VitePress
npm install -D vitepress

# 初始化 VitePress
npx vitepress init
```

## 配置 scripts

编辑 `package.json`，将 scripts 部分修改为：

```json
{
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  }
}
```

## 本地预览

```bash
npm run dev
```

访问 `http://localhost:5173` 确认站点正常运行。

## 常见起步问题

- **端口被占用**：可使用 `npm run dev -- --port 5174`
- **依赖安装慢**：确认网络环境后重试 `npm install`
- **VitePress 初始化失败**：优先升级 Node.js 到 LTS 版本再重试

## 下一步

- [托管到 CNB 平台](./deploy-cnb.md)
- [文档导航](./index.md)
