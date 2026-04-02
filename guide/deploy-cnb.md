# 托管到 CNB 平台

CNB 不仅仅是一个 Git 仓库，更是一个**集代码托管、CI/CD、知识库、边缘部署于一体的云原生开发平台**。

## 创建 CNB 仓库

1. 访问 [cnb.cool](https://cnb.cool)，注册并登录
2. 创建一个新仓库，例如 `my-docs`
3. 将本地项目推送到 CNB：

```bash
git init
git add .
git commit -m "init: vitepress project"
git remote add origin https://cnb.cool/<你的用户名>/my-docs.git
git push -u origin main
```

## 配置 EdgeOne Pages 部署

在项目根目录创建 `edgeone.json`：

```json
{
    "name": "my-docs",
    "buildCommand": "npm run build",
    "installCommand": "npm install",
    "outputDirectory": ".vitepress/dist",
    "nodeVersion": "22.11.0"
}
```

| 字段 | 说明 |
|------|------|
| `buildCommand` | 构建命令，即 `vitepress build` |
| `outputDirectory` | VitePress 默认的构建输出目录 |
| `nodeVersion` | 指定 Node.js 版本 |

## 为什么选择 CNB？

| 特性 | CNB 平台优势 | 传统方案 |
|------|-------------|----------|
| **知识库能力** | 内置向量化流水线，一行配置即可将文档转为语义索引 | 需自建向量数据库（Pinecone/Milvus） |
| **Edge Function** | 与腾讯云 EdgeOne Pages 深度集成 | 需额外购买 Serverless 服务 |
| **CI/CD 流水线** | 声明式 `.cnb.yml`，push 即触发 | 需编写复杂的 GitHub Actions |
| **环境变量注入** | `CNB_TOKEN` 自动注入 | 需手动管理 Secret |
| **一站式体验** | 代码托管 → 知识库 → 构建部署 → MCP 服务，全链路打通 | 需拼凑多个平台 |

## 下一步

- [配置知识库向量化](./knowledge-base.md)
