// Package handler — Standard MCP Streamable HTTP endpoint (/mcp).
//
// Implements MCP JSON-RPC 2.0 over HTTP for external AI clients
// (Cursor, Claude Desktop, VS Code / Cline, Cherry Studio, …).
//
// Supported methods:
//
//	initialize              — handshake; returns server info and capabilities
//	ping                    — heartbeat
//	tools/list              — list available tools
//	tools/call              — execute a tool
//	notifications/initialized — notification (no response needed)
//
// GET  /mcp — service discovery (cached 60 s)
// POST /mcp — main JSON-RPC endpoint; responds with JSON or SSE depending on Accept header
// DELETE /mcp — session termination (no-op)
package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"cloud-functions/internal/config"
	"cloud-functions/internal/knowledge"
)

// ── constants ─────────────────────────────────────────────────────────────────

const (
	mcpServerName      = "vector-mcp-edge-knowledge-mcp"
	mcpServerVersion   = "2.0.0"
	mcpProtocolVersion = "2025-03-26"
)

// ── static text content (matches the JS reference implementation) ─────────────

const mcpProjectInfoText = `# VitePress MCP 智能检索

为 VitePress 文档站点添加 MCP 智能语义搜索能力，基于 CNB 知识库 + EdgeOne Edge Function 实现。

## 技术栈

- **VitePress**: 静态文档站点生成框架
- **CNB 知识库**: 文档向量化存储与语义检索 API
- **EdgeOne Edge Function**: 腾讯云边缘函数，零服务器成本运行 MCP Server
- **MCP 协议**: Model Context Protocol，标准化 AI 工具接口

## 核心功能

- **一条主线学完**: 从 VitePress 初始化、CNB 托管、知识库向量化到 MCP Server 部署验证，按主线教程一步步完成。
- **两套方案清晰分层**: 方案一用于外部 AI 工具接入（MCP）；方案二用于网页端 Go RAG 问答。先主线，后选型。
- **CNB 知识库**: 一行配置实现文档向量化，无需自建向量数据库。push 即触发，自动分块、Embedding、索引构建。
- **EdgeOne Edge Function**: 在边缘函数中实现 MCP Server，零服务器成本、全球加速、自动部署，真正的零运维体验。
- **MCP 协议支持**: 标准化 Model Context Protocol 接口，无缝对接各类主流 AI 助手与大模型平台。

## 项目链接

- 代码仓库: https://cnb.cool/shenzhen/lecturer/vector-mcp-edge
- 在线文档: https://vector-mcp-edge.mintimate.cn`

const mcpQuickstartText = `# 快速开始

从零开始搭建 VitePress MCP 智能检索系统

## 步骤 1：初始化 VitePress 项目

使用 VitePress 初始化一个新的文档站点项目，配置基本的站点信息和导航结构。

详细文档: https://vector-mcp-edge.mintimate.cn/guide/getting-started.html

---

## 步骤 2：托管到 CNB

将项目托管到 CNB 平台，利用其 CI/CD 能力自动构建和部署 VitePress 站点。

详细文档: https://vector-mcp-edge.mintimate.cn/guide/deploy-cnb.html

---

## 步骤 3：知识库向量化

在 CNB 平台配置知识库，启用文档自动分块和 Embedding 向量化，实现语义检索能力。

详细文档: https://vector-mcp-edge.mintimate.cn/guide/knowledge-base.html

---

## 步骤 4：实现 MCP Server

在 EdgeOne Pages 的 Cloud Function 中实现完整的 MCP Server，对外暴露标准 MCP 工具协议。

详细文档: https://vector-mcp-edge.mintimate.cn/guide/mcp-server.html

---

## 步骤 5：部署与验证

部署到 EdgeOne Pages 并验证 MCP 功能，配置 Cursor / Claude 等 AI 客户端接入。

详细文档: https://vector-mcp-edge.mintimate.cn/guide/deploy-verify.html`

const mcpSolutionsText = `# VitePress MCP 智能检索 — 方案对比

## 方案一：接入外部 AI 工具（重点）

通过 EdgeOne Pages 部署的 MCP Server，让外部 AI 工具可以直接检索你的文档知识库。

**支持的工具**: Cursor / Claude Desktop / VS Code (Cline) / Cherry Studio

**优势**:
- 零服务器成本
- 标准 MCP 协议
- CNB_TOKEN 自动鉴权
- 全球 CDN 加速

详细文档: https://vector-mcp-edge.mintimate.cn/features/solution-mcp.html

---

## 方案二：Go RAG 网页问答（进阶）

在网页端提供内嵌的 AI 问答体验，使用 Go 服务编排 LLM + Tool Calling。

**优势**:
- 网页内嵌 AI 助手
- 支持流式输出
- 完整 RAG 编排
- 自定义对话体验

详细文档: https://vector-mcp-edge.mintimate.cn/features/solution-rag.html

---

**推荐**：先完成方案一（MCP），快速为外部 AI 工具提供文档检索能力；再按需扩展方案二（Go RAG）实现网页端 AI 问答。`

// ── MCP tool definitions (tools/list response) ────────────────────────────────

var mcpTools = []map[string]interface{}{
	{
		"name": "query_knowledge_base",
		"description": "Search the VitePress MCP documentation knowledge base using semantic vector search. " +
			"Use this to find information about MCP server setup on EdgeOne Pages, CNB knowledge base " +
			"configuration, VitePress customisation, and deployment workflows.",
		"inputSchema": map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"query": map[string]interface{}{
					"type":        "string",
					"description": "Search query in natural language (Chinese or English). E.g. '如何配置 MCP Server'",
				},
				"keyword": map[string]interface{}{
					"type":        "string",
					"description": "Optional keywords separated by semicolons. E.g. 'EdgeOne;MCP;部署'",
				},
				"top_k": map[string]interface{}{
					"type":        "number",
					"description": "Maximum results to return (default 5, range 1–10).",
				},
			},
			"required": []string{"query"},
		},
	},
	{
		"name":        "get_project_info",
		"description": "Get an overview of the VitePress MCP project: purpose, tech stack, features, and links.",
		"inputSchema": map[string]interface{}{"type": "object", "properties": map[string]interface{}{}},
	},
	{
		"name":        "get_quickstart",
		"description": "Get the step-by-step quick-start guide for setting up VitePress MCP smart search.",
		"inputSchema": map[string]interface{}{"type": "object", "properties": map[string]interface{}{}},
	},
	{
		"name":        "get_solutions",
		"description": "Compare the two available solutions: MCP for external AI tools vs Go RAG for the web.",
		"inputSchema": map[string]interface{}{"type": "object", "properties": map[string]interface{}{}},
	},
}

// ── JSON-RPC types ────────────────────────────────────────────────────────────

type mcpRequest struct {
	JSONRPC string                 `json:"jsonrpc"`
	ID      interface{}            `json:"id"`
	Method  string                 `json:"method"`
	Params  map[string]interface{} `json:"params"`
}

// ── JSON-RPC response helpers ─────────────────────────────────────────────────

func mcpOK(id interface{}, result interface{}) map[string]interface{} {
	return map[string]interface{}{"jsonrpc": "2.0", "id": id, "result": result}
}

func mcpError(id interface{}, code int, message string) map[string]interface{} {
	return map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      id,
		"error":   map[string]interface{}{"code": code, "message": message},
	}
}

func mcpText(text string) map[string]interface{} {
	return map[string]interface{}{
		"content": []map[string]interface{}{{"type": "text", "text": text}},
	}
}

func mcpErrorContent(text string) map[string]interface{} {
	return map[string]interface{}{
		"content": []map[string]interface{}{{"type": "text", "text": text}},
		"isError": true,
	}
}

// ── protocol method handlers ──────────────────────────────────────────────────

func mcpInitialize(req mcpRequest) map[string]interface{} {
	return mcpOK(req.ID, map[string]interface{}{
		"protocolVersion": mcpProtocolVersion,
		"capabilities":    map[string]interface{}{"tools": map[string]interface{}{"listChanged": false}},
		"serverInfo":      map[string]interface{}{"name": mcpServerName, "version": mcpServerVersion},
	})
}

func mcpPing(req mcpRequest) map[string]interface{} {
	return mcpOK(req.ID, map[string]interface{}{})
}

func mcpToolsList(req mcpRequest) map[string]interface{} {
	return mcpOK(req.ID, map[string]interface{}{"tools": mcpTools})
}

func mcpToolsCall(req mcpRequest, cfg config.Config) map[string]interface{} {
	name, _ := req.Params["name"].(string)
	args, _ := req.Params["arguments"].(map[string]interface{})

	switch name {
	case "query_knowledge_base":
		return mcpQueryKnowledge(req.ID, args, cfg)
	case "get_project_info":
		return mcpOK(req.ID, mcpText(mcpProjectInfoText))
	case "get_quickstart":
		return mcpOK(req.ID, mcpText(mcpQuickstartText))
	case "get_solutions":
		return mcpOK(req.ID, mcpText(mcpSolutionsText))
	default:
		return mcpError(req.ID, -32602, fmt.Sprintf("Unknown tool: %s", name))
	}
}

func mcpQueryKnowledge(id interface{}, args map[string]interface{}, cfg config.Config) map[string]interface{} {
	if args == nil {
		return mcpError(id, -32602, "Missing required parameter: query")
	}
	query, _ := args["query"].(string)
	if query == "" {
		return mcpError(id, -32602, "Missing required parameter: query")
	}
	kw, _ := args["keyword"].(string)
	topK := 5
	if v, ok := args["top_k"].(float64); ok {
		topK = int(math.Max(1, math.Min(10, math.Floor(v))))
	}

	result, err := knowledge.Query(cfg, query, kw, topK)
	if err != nil {
		return mcpOK(id, mcpErrorContent(fmt.Sprintf("Error querying knowledge base: %v", err)))
	}
	content := knowledge.FormatResult(result)
	if content == "" {
		content = "No results found for the given query."
	}
	return mcpOK(id, mcpText(content))
}

// mcpDispatch routes a single JSON-RPC request. Returns nil for notifications.
func mcpDispatch(req mcpRequest, cfg config.Config) map[string]interface{} {
	switch req.Method {
	case "initialize":
		return mcpInitialize(req)
	case "ping":
		return mcpPing(req)
	case "tools/list":
		return mcpToolsList(req)
	case "tools/call":
		return mcpToolsCall(req, cfg)
	case "notifications/initialized":
		return nil // notification — no response
	default:
		if req.ID != nil {
			fmt.Printf("[MCP] unknown method: %s\n", req.Method)
		}
		return mcpError(req.ID, -32601, fmt.Sprintf("Method not found: %s", req.Method))
	}
}

// ── HTTP entry point ──────────────────────────────────────────────────────────

// MCPStreamable returns the Gin handler for the standard MCP Streamable HTTP transport.
// Register with r.Any("/mcp", handler.MCPStreamable(cfg)).
func MCPStreamable(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {

		case http.MethodGet:
			// Service-discovery endpoint; 60 s cache to reduce heartbeat overhead.
			c.Header("Cache-Control", "public, max-age=60")
			c.JSON(http.StatusOK, gin.H{
				"name":            mcpServerName,
				"version":         mcpServerVersion,
				"description":     "MCP server for VitePress MCP 智能检索. Use POST to interact.",
				"protocolVersion": mcpProtocolVersion,
				"availableTools":  mcpToolSummary(),
			})

		case http.MethodDelete:
			c.Status(http.StatusOK)

		case http.MethodPost:
			if !strings.Contains(c.GetHeader("Content-Type"), "application/json") {
				c.JSON(http.StatusUnsupportedMediaType,
					mcpError(nil, -32700, "Content-Type must be application/json"))
				return
			}
			body, err := io.ReadAll(c.Request.Body)
			if err != nil {
				c.JSON(http.StatusBadRequest, mcpError(nil, -32700, "Failed to read request body"))
				return
			}

			useSSE := strings.Contains(c.GetHeader("Accept"), "text/event-stream")
			trimmed := bytes.TrimSpace(body)

			if len(trimmed) > 0 && trimmed[0] == '[' {
				// Batch request
				var batch []mcpRequest
				if err := json.Unmarshal(body, &batch); err != nil {
					c.JSON(http.StatusBadRequest, mcpError(nil, -32700, "Parse error: Invalid JSON"))
					return
				}
				var results []map[string]interface{}
				for _, req := range batch {
					if r := mcpDispatch(req, cfg); r != nil {
						results = append(results, r)
					}
				}
				if len(results) == 0 {
					c.Status(http.StatusAccepted)
					return
				}
				if useSSE {
					writeMCPSSEBatch(c, results)
				} else {
					c.JSON(http.StatusOK, results)
				}
			} else {
				// Single request
				var req mcpRequest
				if err := json.Unmarshal(body, &req); err != nil {
					c.JSON(http.StatusBadRequest, mcpError(nil, -32700, "Parse error: Invalid JSON"))
					return
				}
				result := mcpDispatch(req, cfg)
				if result == nil {
					c.Status(http.StatusAccepted)
					return
				}
				if useSSE {
					writeMCPSSE(c, result)
				} else {
					c.JSON(http.StatusOK, result)
				}
			}

		default:
			c.JSON(http.StatusMethodNotAllowed, mcpError(nil, -32600, "Method not allowed"))
		}
	}
}

// ── SSE helpers ───────────────────────────────────────────────────────────────

func mcpToolSummary() []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(mcpTools))
	for _, t := range mcpTools {
		out = append(out, map[string]interface{}{
			"name":        t["name"],
			"description": t["description"],
		})
	}
	return out
}

func writeMCPSSE(c *gin.Context, data map[string]interface{}) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	b, _ := json.Marshal(data)
	fmt.Fprintf(c.Writer, "event: message\ndata: %s\n\n", string(b))
	c.Writer.Flush()
}

func writeMCPSSEBatch(c *gin.Context, data []map[string]interface{}) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	for _, item := range data {
		b, _ := json.Marshal(item)
		fmt.Fprintf(c.Writer, "event: message\ndata: %s\n\n", string(b))
	}
	c.Writer.Flush()
}
