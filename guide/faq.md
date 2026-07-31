# 常见问题 FAQ

## 为什么 MCP 与 Agent 要分开放？

MCP 是外部客户端的协议入口，Agent 是网页端的模型运行时。分开后路径级 Node Function 无需持有模型密钥或会话状态，Agent 则可以直接使用 Makers AI Gateway、Store 和中止能力。

## 为什么我会觉得“快速开始”和“方案对比”冲突？

当两者处于同级主入口时，新用户会在“先做什么”上犹豫。正确做法是：先主线落地，再做方案选型。

## CNB Token 需要手动配置吗？

托管 Agent 中的 `CNB_KNOWLEDGE_BASE_TOKEN` 是业务变量，需要通过 `edgeone makers env set` 配置。不要把 Token 暴露到 `AI_` 前缀的浏览器变量中。

## `top_k` 设置多少合适？

建议从 3 开始。若召回不足可升到 5；若噪音过多可降到 2~3 并结合 `keyword` 过滤。

## 多轮历史保存在哪里？

前端只保存一个 conversation ID。具体消息由 `context.store.openaiSession(conversationId)` 管理，不需要浏览器重复发送历史数组。

## AI Gateway 变量需要手动上传吗？

只要 `.env.example` 声明 `AI_GATEWAY_API_KEY` 与 `AI_GATEWAY_BASE_URL`，Makers 部署流程会自动配置。`AI_GATEWAY_MODEL` 可以留空使用项目默认模型。

## 如何判断检索质量是否变差？

- 看同类问题命中率是否下降
- 看返回片段是否更“偏题”
- 看用户是否频繁重问同一问题

可通过增加关键词约束、调整文档结构、优化工具描述来改进。
