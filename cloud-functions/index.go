// VitePress MCP 智能检索后端 — EdgeOne Pages Go Cloud Function (Framework 模式)
//
// 路由总览：
//
//	GET  /                     — 服务信息
//	GET  /api/v1/health        — 健康检查
//	POST /api/v1/chat          — RAG 非流式问答
//	POST /api/v1/chat/stream   — RAG 流式问答（SSE）
//	GET  /api/v1/mcp/tools     — Tool Use 工具列表（前端 AI 组件）
//	POST /api/v1/mcp/tools/call — Tool Use 工具调用（前端 AI 组件）
//	POST /api/v1/mcp/llm/chat  — Tool Use LLM 聊天，支持 function calling（前端 AI 组件）
//	ANY  /mcp                  — 标准 MCP Streamable HTTP 端点（外部 AI 客户端）
//
// 包结构：
//
//	internal/config/    — Config 结构、loadConfig、CORS 中间件、AI 客户端
//	internal/knowledge/ — CNB 知识库 HTTP 客户端、结果格式化
//	internal/handler/   — 各路由 handler（rag.go / tooluse.go / mcp.go）
//
// 注意：EdgeOne Pages Framework 模式要求入口文件（index.go）必须在
// cloud-functions/ 根目录，因此无法使用 cmd/ 子目录作为入口。

package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"

	"cloud-functions/internal/config"
	"cloud-functions/internal/handler"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	cfg := config.Load()
	aiClient := config.NewAIClient(cfg)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(config.CORSMiddleware())

	registerRoutes(r, cfg, aiClient)
	r.Run(":9000")
}

// registerRoutes 是唯一的路由编排入口，保持 main() 整洁。
// 各 handler 的具体实现分别在 internal/handler/ 包中。
func registerRoutes(r *gin.Engine, cfg config.Config, aiClient *openai.Client) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "VitePress MCP 智能检索后端",
			"status":  "running",
			"endpoints": map[string]string{
				"health": "/api/v1/health",
				"chat":   "/api/v1/chat",
				"stream": "/api/v1/chat/stream",
				"tools":  "/api/v1/mcp/tools",
				"mcp":    "/mcp",
			},
		})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "RAG 服务运行正常"})
		})

		// RAG 问答 — 前端 AI 组件直接调用
		api.POST("/chat", handler.RagChat(cfg, aiClient))
		api.POST("/chat/stream", handler.RagStreamChat(cfg, aiClient))

		// Tool Use — 前端 AI 组件 Function Calling 流程
		mcpGroup := api.Group("/mcp")
		{
			mcpGroup.GET("/tools", handler.ToolsList(cfg))
			mcpGroup.POST("/tools/call", handler.ToolsCall(cfg))
			mcpGroup.POST("/llm/chat", handler.LLMChat(cfg, aiClient))
		}
	}

	// 标准 MCP Streamable HTTP — 供 Cursor / Claude Desktop 等外部 AI 客户端接入
	r.Any("/mcp", handler.MCPStreamable(cfg))
}
