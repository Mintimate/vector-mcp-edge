# 配置网页端 AI 助手

本项目已内置网页端 AI 助手聊天组件，只需部署 [Knowledge Maker](https://github.com/Mintimate/knowledge-maker) Go 后端并配置环境变量即可启用。

## 前置条件

- 已完成主线教程（知识库向量化 + MCP Server 部署）
- 已部署 Knowledge Maker Go 后端
- Go 后端已配置 LLM（如 DeepSeek）和 CNB 知识库

## 第一步：部署 Go 后端

推荐使用 Docker Compose 部署 [Knowledge Maker](https://github.com/Mintimate/knowledge-maker)，一行命令即可启动。

### Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
services:
  knowledge-maker:
    image: docker.cnb.cool/mintimate/tool-forge/knowledge-maker
    container_name: knowledge-maker
    volumes:
      - ./logs:/app/logs
    ports:
      - "8100:8082"
    environment:
      - PORT=8082
      - GIN_MODE=debug
      - AI_BASE_URL=<你的 LLM API 地址>
      - AI_API_KEY=${AI_API_KEY}
      - AI_MODEL=<模型名称>
      - KNOWLEDGE_BASE_URL=https://api.cnb.cool/<用户名>/<仓库组>/<仓库名>/-/knowledge/base/query
      - KNOWLEDGE_TOKEN=${KNOWLEDGE_TOKEN}
      - KNOWLEDGE_TOP_K=3
      - RAG_SYSTEM_PROMPT=|
        你是 AI 助手，专门基于知识库内容回答问题。
        请严格遵循以下规则：
        1. 基于提供的知识库内容进行回答，确保信息准确
        2. 使用用户使用的语言（如中文、英文）进行回答
        3. 拒绝与知识库无关的问题
    restart: unless-stopped
```

创建 `.env` 文件存放密钥（不要提交到 Git）：

```bash
AI_API_KEY=your_api_key_here
KNOWLEDGE_TOKEN=your_cnb_token_here
```

启动服务：

```bash
docker compose up -d
```

::: warning 密钥安全
`AI_API_KEY` 和 `KNOWLEDGE_TOKEN` 必须通过 `.env` 文件传入，**不要**直接写在 `docker-compose.yml` 中。确保 `.env` 已在 `.gitignore` 中。
:::

启动后确认以下接口可用：

```bash
curl http://localhost:8100/api/v1/mcp/tools
```

## 第二步：配置环境变量

### 开发环境

在终端设置环境变量后启动开发服务器：

```bash
export AI_MCP_BASE_URL=http://localhost:8100/api/v1/mcp
yarn dev
```

### 生产环境

在 CNB 流水线或部署平台中添加环境变量：

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `AI_MCP_BASE_URL` | 是 | Go 后端地址，**必须包含 `/api/v1/mcp`** |
| `AI_MAX_HISTORY_TURNS` | 否 | 最大对话历史轮数，默认 `3` |
| `AI_WELCOME_MESSAGE` | 否 | 自定义欢迎消息 |
| `AI_DEFAULT_TOOLS` | 否 | 降级工具定义 JSON |

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

1. 检查 Go 后端是否运行
2. 用 `curl` 测试 `GET /api/v1/mcp/tools` 是否返回工具列表
3. 检查浏览器控制台的网络请求是否 404（通常是路径拼接错误）
4. 确认 `AI_MCP_BASE_URL` 以 `/api/v1/mcp` 结尾

### 环境变量不生效

本项目通过 `vite.config.mjs` 的 `define` 机制注入 `AI_` 前缀变量，无需 `VITE_` 前缀。如果修改了环境变量，需要**重启开发服务器**才能生效。

## 下一步

- [方案二详情](../features/solution-rag)：了解完整的 AI 助手架构设计
- [本站 MCP 端点](../features/mcp-endpoint)：了解方案一的 MCP 端点
