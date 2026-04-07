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
	_ "embed"
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

// ── embed static text content ─────────────────────────────────────────────────

//go:embed static/project_info.md
var mcpProjectInfoText string

//go:embed static/quickstart.md
var mcpQuickstartText string

//go:embed static/solutions.md
var mcpSolutionsText string

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
		"description": "Compare the available solutions: Go Cloud Function (recommended) vs legacy JS MCP and Go RAG.",
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
