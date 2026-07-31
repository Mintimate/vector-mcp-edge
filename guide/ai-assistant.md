# 配置网页端 AI 助手

网页助手现在直接连接 EdgeOne Makers 托管 Agent。浏览器不再获取工具列表、调用模型或手工回传工具结果。

## 接口约定

| 端点 | 请求约定 |
|------|----------|
| `POST /chat` | body 为 `{ "message": "..." }`，请求头必须带 `makers-conversation-id` |
| `POST /stop` | body 为 `{ "conversation_id": "..." }`，当前 Makers runtime 还要求携带同一个 `makers-conversation-id` 请求头 |

`/chat` 返回 SSE，前端处理 `reasoning`、`ai_response`、`tool_call`、`tool_result`、`ping`、`usage` 和 `error_message`，并以 `[DONE]` 作为结束标记。支持思考的模型会通过 `reasoning` 返回推理增量，前端将其显示在可折叠的“AI 思考过程”区域。

## 前端实现

`useAgent.js` 会用 `crypto.randomUUID()` 创建 conversation ID，并持久化到 `localStorage`。同一 ID 会跨请求复用，因此 Agent 可以从 Makers Store 恢复多轮上下文。

```js
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'makers-conversation-id': conversationId
  },
  body: JSON.stringify({ message })
})
```

停止生成时，组件调用 `/stop`，同时中止本地 `fetch`：

```js
await fetch('/stop', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'makers-conversation-id': conversationId
  },
  body: JSON.stringify({ conversation_id: conversationId })
})
```

## 直连方式

聊天组件固定请求同域 `/chat`，停止生成固定请求同域 `/stop`。不再使用 `AI_AGENT_BASE_URL`，也不会经过 `/mcp` 或浏览器端 Tool Calling。

## 本地验证

使用 Makers 本地代理启动完整项目：

```bash
npm run dev:makers
```

请使用 CLI 输出的代理地址访问站点；单独运行 VitePress 的端口不会代理 `agents/` 路由。

也可以直接验证 Agent：

```bash
curl -N http://127.0.0.1:8088/chat \
  -H 'Content-Type: application/json' \
  -H "makers-conversation-id: $(uuidgen)" \
  -d '{"message":"EdgeOne Makers 如何部署这个项目？"}'
```

## 组件结构

```text
.vitepress/theme/components/aiChat/
├── index.vue
├── aiChat.styles.css
└── composables/
    ├── useAgent.js
    ├── useChat.js
    └── useMarkdown.js
```

## 排查

- `400 Missing makers-conversation-id`：检查 `/chat` 请求头。
- `500 Missing environment variables`：检查 Makers 项目环境变量。
- 请求只有静态页面响应：确认访问的是 `edgeone makers dev` 代理端口。
- 停止按钮无效：确认 `/stop` 的 body 和 `makers-conversation-id` 请求头使用同一个 ID。
