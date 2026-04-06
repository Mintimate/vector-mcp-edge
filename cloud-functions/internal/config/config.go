//	KNOWLEDGE_API_URL — CNB knowledge base query API endpoint
//	CNB_TOKEN         — knowledge base auth token
//	AI_BASE_URL       — OpenAI-compatible API base URL
//	AI_API_KEY        — AI API key
//	AI_MODEL          — model name, e.g. deepseek-r1
//	RAG_SYSTEM_PROMPT — (optional) system prompt for RAG; falls back to built-in default
package config

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"
)

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	KnowledgeAPIURL string
	KnowledgeToken  string
	AIBaseURL       string
	AIAPIKey        string
	AIModel         string
	RAGSystemPrompt string
}

// Load reads configuration from environment variables.
func Load() Config {
	prompt := os.Getenv("RAG_SYSTEM_PROMPT")
	if prompt == "" {
		prompt = "你是一个专业的知识库助手，请根据提供的知识库内容回答用户的问题。如果知识库中没有相关内容，请如实告知用户。"
	}
	return Config{
		KnowledgeAPIURL: os.Getenv("KNOWLEDGE_API_URL"),
		KnowledgeToken:  os.Getenv("CNB_TOKEN"),
		AIBaseURL:       os.Getenv("AI_BASE_URL"),
		AIAPIKey:        os.Getenv("AI_API_KEY"),
		AIModel:         os.Getenv("AI_MODEL"),
		RAGSystemPrompt: prompt,
	}
}

// CORSMiddleware returns a Gin middleware that sets CORS headers and handles OPTIONS preflight.
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Mcp-Session-Id")
		c.Header("Access-Control-Expose-Headers", "Mcp-Session-Id")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

// NewAIClient creates an OpenAI-compatible client from Config.
// Timeout is 0 (no timeout) to support long streaming responses;
// compression is disabled to reduce first-byte latency.
func NewAIClient(cfg Config) *openai.Client {
	c := openai.DefaultConfig(cfg.AIAPIKey)
	if cfg.AIBaseURL != "" {
		c.BaseURL = cfg.AIBaseURL
	}
	c.HTTPClient = &http.Client{
		Timeout: 0,
		Transport: &http.Transport{
			MaxIdleConns:       100,
			IdleConnTimeout:    90 * time.Second,
			DisableCompression: true,
		},
	}
	return openai.NewClientWithConfig(c)
}
