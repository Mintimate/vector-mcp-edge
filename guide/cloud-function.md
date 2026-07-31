# EdgeOne Makers 与托管 Agent

本教程将 VitePress、标准 MCP Cloud Function 和网页问答 Agent 一起部署到 EdgeOne Makers。

## 项目结构

```text
agents/
├── _model.ts                 # AI Gateway 模型
├── _shared.ts                # SSE、JSON 响应工具
├── chat/
│   ├── index.ts              # POST /chat
│   └── _knowledge.ts         # CNB 知识库 Agent Tool
└── stop/
    └── index.ts              # POST /stop

cloud-functions/
├── mcp.js                    # /mcp：MCP Streamable HTTP
└── api/v1/health.js          # /api/v1/health
```

`agents/` 负责模型推理；`cloud-functions/` 负责不含模型调用的路径级 MCP 协议服务。Makers 会根据文件目录自动注册路由，不要手工维护 `.edgeone/agent-node/config.json`。

## 安装依赖

```bash
npm install @openai/agents openai zod
```

`edgeone.json` 必须声明 Agent 框架：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".vitepress/dist",
  "agents": {
    "framework": "openai-agents-sdk",
    "externalNodeModules": ["openai", "@openai/agents"]
  }
}
```

## 配置环境变量

```env
AI_GATEWAY_API_KEY=
AI_GATEWAY_BASE_URL=
AI_GATEWAY_MODEL=
CNB_KNOWLEDGE_BASE_URL=
CNB_KNOWLEDGE_BASE_TOKEN=
```

AI Gateway 的 key 与 base URL 由 Makers 自动配置。部署前设置 CNB 变量：

```bash
PAGES_SOURCE=skills edgeone makers env set CNB_KNOWLEDGE_BASE_URL \
  'https://api.cnb.cool/<用户名>/<仓库组>/<仓库名>/-/knowledge/base/query'
PAGES_SOURCE=skills edgeone makers env set CNB_KNOWLEDGE_BASE_TOKEN '<CNB Token>'
```

本地开发可从远端拉取变量：

```bash
PAGES_SOURCE=skills edgeone makers link
PAGES_SOURCE=skills edgeone makers env pull
```

## Agent 关键点

`agents/chat/index.ts` 使用固定入口：

```ts
export async function onRequest(context: any) {
  const message = context.request.body?.message
  const conversationId = context.conversation_id
  const signal = context.request.signal
  // Agent + tool + session + SSE
}
```

实现遵循以下约定：

- 环境变量只从 `context.env` 读取。
- 会话使用 `context.store.openaiSession(conversationId)`。
- 模型通过 Makers `AI_GATEWAY_*` 访问。
- 工具循环最多 4 轮，并传入 `AbortSignal`。
- SSE 每 5 秒心跳，包含 `X-Accel-Buffering: no`，结束发送 `[DONE]`。
- `/stop` handler 从 body 读取目标 `conversation_id`；当前 Makers runtime 还要求请求头携带同一个 conversation ID 才会进入 handler。

## 本地开发

```bash
npm run dev:makers
```

必须使用 Makers CLI 输出的代理 URL 测试站点和 `/chat`。MCP 可单独验证：

```bash
curl http://127.0.0.1:8088/mcp
```

Agent 可通过 SSE 验证：

```bash
curl -N http://127.0.0.1:8088/chat \
  -H 'Content-Type: application/json' \
  -H "makers-conversation-id: $(uuidgen)" \
  -d '{"message":"MCP 端点如何接入？"}'
```

## 部署

```bash
npm run deploy:makers -- -n vector-mcp-edge
```

使用 Token 的 CI 命令：

```bash
PAGES_SOURCE=skills edgeone makers deploy -n vector-mcp-edge -t "$EO_SECRET"
```

CNB 流水线中的部署阶段也应使用 `edgeone makers deploy`。部署后依次验证 `/api/v1/health`、`/mcp` 和 `/chat`。

## 从旧 Go RAG 迁移

1. 将模型调用从旧 Go Function 移入 `agents/chat`。
2. 删除 `/api/v1/chat/*` 与 `/api/v1/mcp/*` 内部 Tool Use 路由。
3. 保留 `/mcp`，让外部 AI 客户端继续使用原地址。
4. 前端改为调用 `/chat`，并发送 `makers-conversation-id`。
5. 用 Makers Store 替代浏览器手工拼接历史消息。
6. 将 `AI_BASE_URL`、`AI_API_KEY` 改为平台托管的 `AI_GATEWAY_*`。
7. 将 catch-all Go Framework MCP 改成 `cloud-functions/mcp.js`，避免它接管 VitePress 静态路由。

## 相关文档

- [配置网页端 AI 助手](./ai-assistant)
- [部署与验证](./deploy-verify)
- [架构全景图](/features/architecture)
