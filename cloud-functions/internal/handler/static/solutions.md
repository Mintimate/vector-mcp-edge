# VitePress MCP 智能检索 — 方案说明

## 当前方案：Go Cloud Function（推荐）

使用 EdgeOne Pages 的 Go Cloud Function，将 MCP Server、RAG 问答、Tool Use 全部整合在边缘函数中，一个服务同时提供：

- **MCP 端点**：标准 MCP 协议，供 Cursor / Claude Desktop / VS Code (Cline) / Cherry Studio 等外部 AI 工具接入
- **网页端 AI 助手**：RAG 问答 + Tool Use，直接嵌入 VitePress 前端

**优势**:
- 零服务器成本
- 标准 MCP 协议
- CNB_TOKEN 自动鉴权
- 全球 CDN 加速
- 无需分开部署，一体化方案

详细文档: https://vector-mcp-edge.mintimate.cn/features/solution-go-function.html

---

## 历史方案（已归档）

由于 EdgeOne Pages 早期仅支持 JS Cloud Function，本项目最初将功能拆分为两种独立方案。2026 年 4 月 EdgeOne Pages 新增 Go Cloud Function 支持后，两种方案已合并升级为当前的一体化方案。

### JS Serverless MCP（已归档）

用 JS 边缘函数实现 MCP Server，仅提供外部 AI 工具检索能力，不支持网页端 AI 助手。

详细文档: https://vector-mcp-edge.mintimate.cn/features/solution-mcp.html

### Go RAG 自建服务（已归档）

需要自建 Go 服务器，提供网页端 AI 问答，但无法提供 MCP 端点。

详细文档: https://vector-mcp-edge.mintimate.cn/features/solution-rag.html

---

**推荐**：直接使用 Go Cloud Function 方案，一步到位获得 MCP + 网页端 AI 助手能力。
