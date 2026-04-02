/**
 * MCP Server Implementation on EdgeOne Pages Cloud Function
 *
 * Implements the Model Context Protocol (MCP) using Streamable HTTP transport.
 * Provides tools to search the project's knowledge base and retrieve
 * useful information about VitePress MCP 智能检索.
 *
 * File path: cloud-functions/mcp/index.js
 * Access path: https://vector-mcp-edge.mintimate.cn/mcp
 */

// ============ Constants ============
const KNOWLEDGE_API_URL =
  "https://api.cnb.cool/shenzhen/lecturer/vector-mcp-edge/-/knowledge/base/query";
const KNOWLEDGE_AUTH_TOKEN = process.env.CNB_TOKEN;

const SERVER_INFO = {
  name: "vector-mcp-edge-knowledge-mcp",
  version: "1.0.0",
};

const SUPPORTED_PROTOCOL_VERSION = "2025-03-26";

// ============ CORS Headers ============
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

// ============ Static Data: Project Info ============
const PROJECT_INFO = {
  name: "VitePress MCP 智能检索",
  description:
    "为 VitePress 文档站点添加 MCP 智能语义搜索能力，基于 CNB 知识库 + EdgeOne Edge Function 实现。",
  repository: "https://cnb.cool/shenzhen/lecturer/vector-mcp-edge",
  site: "https://vector-mcp-edge.mintimate.cn",
  techStack: [
    { name: "VitePress", description: "静态文档站点生成框架" },
    { name: "CNB 知识库", description: "文档向量化存储与语义检索 API" },
    { name: "EdgeOne Edge Function", description: "腾讯云边缘函数，零服务器成本运行 MCP Server" },
    { name: "MCP 协议", description: "Model Context Protocol，标准化 AI 工具接口" },
  ],
  features: [
    {
      title: "一条主线学完",
      description:
        "从 VitePress 初始化、CNB 托管、知识库向量化到 MCP Server 部署验证，按主线教程一步步完成。",
    },
    {
      title: "两套方案清晰分层",
      description:
        "方案一用于外部 AI 工具接入（MCP）；方案二用于网页端 Go RAG 问答。先主线，后选型。",
    },
    {
      title: "CNB 知识库",
      description:
        "一行配置实现文档向量化，无需自建向量数据库。push 即触发，自动分块、Embedding、索引构建。",
    },
    {
      title: "EdgeOne Edge Function",
      description:
        "在边缘函数中实现 MCP Server，零服务器成本、全球加速、自动部署，真正的零运维体验。",
    },
    {
      title: "MCP 协议支持",
      description:
        "标准化 Model Context Protocol 接口，无缝对接各类主流 AI 助手与大模型平台。",
    },
  ],
};

// ============ Static Data: Quickstart Guide ============
const QUICKSTART_STEPS = {
  title: "快速开始",
  description: "从零开始搭建 VitePress MCP 智能检索系统",
  steps: [
    {
      step: 1,
      title: "初始化 VitePress 项目",
      description:
        "使用 VitePress 初始化一个新的文档站点项目，配置基本的站点信息和导航结构。",
      link: "https://vector-mcp-edge.mintimate.cn/guide/getting-started.html",
    },
    {
      step: 2,
      title: "托管到 CNB",
      description:
        "将项目托管到 CNB 平台，利用其 CI/CD 能力自动构建和部署 VitePress 站点。",
      link: "https://vector-mcp-edge.mintimate.cn/guide/deploy-cnb.html",
    },
    {
      step: 3,
      title: "知识库向量化",
      description:
        "在 CNB 平台配置知识库，启用文档自动分块和 Embedding 向量化，实现语义检索能力。",
      link: "https://vector-mcp-edge.mintimate.cn/guide/knowledge-base.html",
    },
    {
      step: 4,
      title: "实现 MCP Server",
      description:
        "在 EdgeOne Pages 的 Cloud Function 中实现完整的 MCP Server，对外暴露标准 MCP 工具协议。",
      link: "https://vector-mcp-edge.mintimate.cn/guide/mcp-server.html",
    },
    {
      step: 5,
      title: "部署与验证",
      description:
        "部署到 EdgeOne Pages 并验证 MCP 功能，配置 Cursor / Claude 等 AI 客户端接入。",
      link: "https://vector-mcp-edge.mintimate.cn/guide/deploy-verify.html",
    },
  ],
};

// ============ Static Data: Solutions ============
const SOLUTIONS = {
  solution1: {
    name: "方案一：接入外部 AI 工具（重点）",
    description:
      "通过 EdgeOne Pages 部署的 MCP Server，让外部 AI 工具可以直接检索你的文档知识库。",
    tools: ["Cursor", "Claude Desktop", "VS Code (Cline)", "Cherry Studio"],
    advantages: [
      "零服务器成本",
      "标准 MCP 协议",
      "CNB_TOKEN 自动鉴权",
      "全球 CDN 加速",
    ],
    link: "https://vector-mcp-edge.mintimate.cn/features/solution-mcp.html",
  },
  solution2: {
    name: "方案二：自建 Go 服务 RAG（进阶）",
    description:
      "在网页端提供内嵌的 AI 问答体验，使用 Go 服务编排 LLM + Tool Calling。",
    advantages: [
      "网页内嵌 AI 助手",
      "支持流式输出",
      "完整 RAG 编排",
      "自定义对话体验",
    ],
    link: "https://vector-mcp-edge.mintimate.cn/features/solution-rag.html",
  },
};

// ============ Tool Definitions ============
const TOOLS = [
  {
    name: "query_knowledge_base",
    description:
      "Search the VitePress MCP documentation knowledge base using semantic vector search. " +
      "Use this tool to find information about setting up MCP servers on EdgeOne Pages, " +
      "CNB knowledge base configuration, VitePress customization, and deployment workflows. " +
      "Supports both semantic query and keyword-based search.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query in natural language (supports both Chinese and English). " +
            "For example: '如何配置 MCP Server' or 'How to deploy to EdgeOne Pages'",
        },
        keyword: {
          type: "string",
          description:
            "Optional keywords for search, separated by semicolons. " +
            "For example: 'EdgeOne;MCP;部署'. When provided along with query, " +
            "both semantic and keyword matching will be combined for better results.",
        },
        top_k: {
          type: "number",
          description:
            "Maximum number of results to return (default: 5, range: 1-10). " +
            "Use a smaller value for focused answers or a larger value for comprehensive research.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_project_info",
    description:
      "Get an overview of the VitePress MCP project, including its purpose, tech stack, " +
      "features, and repository links. Useful for answering questions like 'What is this project about?', " +
      "'What technologies does it use?', or 'What can this project do?'.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_quickstart",
    description:
      "Get the quick start guide for setting up VitePress MCP smart search. " +
      "Returns step-by-step instructions with links to detailed documentation. " +
      "Useful for answering 'How to get started?' or 'What are the setup steps?'.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_solutions",
    description:
      "Get information about the two available solutions: " +
      "Solution 1 (MCP for external AI tools) and Solution 2 (Go RAG for web). " +
      "Returns a comparison with pros, cons, and use cases for each.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ============ Knowledge Base Client ============
async function queryKnowledgeBase(query, keyword, topK) {
  const payload = { query };
  if (keyword) {
    payload.keyword = keyword;
  }
  if (topK && topK > 0) {
    payload.top_k = topK;
  }

  const response = await fetch(KNOWLEDGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: KNOWLEDGE_AUTH_TOKEN,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Knowledge base API error: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

// ============ Helper: Create JSON Response ============
function jsonResponse(statusCode, data, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

// ============ Helper: Create SSE Response ============
function sseResponse(results) {
  const items = Array.isArray(results) ? results : [results];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      for (const item of items) {
        controller.enqueue(
          encoder.encode(`event: message\ndata: ${JSON.stringify(item)}\n\n`)
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ============ MCP Protocol Handlers ============

function handleInitialize(request) {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      protocolVersion: SUPPORTED_PROTOCOL_VERSION,
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: SERVER_INFO,
    },
  };
}

function handleToolsList(request) {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      tools: TOOLS,
    },
  };
}

async function handleToolsCall(request) {
  const { name, arguments: args } = request.params;

  console.log(`[MCP] tools/call ${name} - args: ${JSON.stringify(args || {})}`);

  switch (name) {
    case "query_knowledge_base":
      return await handleQueryTool(request.id, args);
    case "get_project_info":
      return handleProjectInfoTool(request.id);
    case "get_quickstart":
      return handleQuickstartTool(request.id);
    case "get_solutions":
      return handleSolutionsTool(request.id);
    default:
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: `Unknown tool: ${name}`,
        },
      };
  }
}

function handlePing(request) {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {},
  };
}

function createErrorResponse(id, code, message) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  };
}

// ============ Tool Handlers ============

async function handleQueryTool(id, args) {
  if (!args || !args.query) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32602,
        message:
          'Missing required parameter: query. ' +
          'Usage: {"query": "your search text", "keyword": "optional;keywords"}',
      },
    };
  }

  // 限制 top_k 范围为 1-10，默认 5
  const topK = args.top_k ? Math.max(1, Math.min(10, Math.floor(args.top_k))) : 5;

  try {
    const result = await queryKnowledgeBase(args.query, args.keyword, topK);

    // 格式化知识库搜索结果
    let content = "";
    if (result.data && Array.isArray(result.data)) {
      content = result.data
        .map((item, index) => {
          const title =
            item.metadata?.name || item.metadata?.path || "Untitled";
          const text = item.chunk || item.content || item.text || "";
          const score = item.score
            ? ` (relevance: ${item.score.toFixed(3)})`
            : "";
          const url = item.metadata?.url ? `\nSource: ${item.metadata.url}` : "";
          return `## ${index + 1}. ${title}${score}\n\n${text}${url}`;
        })
        .join("\n\n---\n\n");
    } else {
      content = JSON.stringify(result, null, 2);
    }

    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: content || "No results found for the given query.",
          },
        ],
      },
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: `Error querying knowledge base: ${error.message}`,
          },
        ],
        isError: true,
      },
    };
  }
}

function handleProjectInfoTool(id) {
  let content = `# ${PROJECT_INFO.name}\n\n`;
  content += `${PROJECT_INFO.description}\n\n`;

  content += "## 技术栈\n\n";
  content += PROJECT_INFO.techStack
    .map((t) => `- **${t.name}**: ${t.description}`)
    .join("\n");

  content += "\n\n## 核心功能\n\n";
  content += PROJECT_INFO.features
    .map((f) => `- **${f.title}**: ${f.description}`)
    .join("\n");

  content += "\n\n## 项目链接\n\n";
  content += `- 代码仓库: ${PROJECT_INFO.repository}\n`;
  content += `- 在线文档: ${PROJECT_INFO.site}\n`;

  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: content }],
    },
  };
}

function handleQuickstartTool(id) {
  let content = `# ${QUICKSTART_STEPS.title}\n\n`;
  content += `${QUICKSTART_STEPS.description}\n\n`;

  content += QUICKSTART_STEPS.steps
    .map((s) => `## 步骤 ${s.step}：${s.title}\n\n${s.description}\n\n详细文档: ${s.link}`)
    .join("\n\n---\n\n");

  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: content }],
    },
  };
}

function handleSolutionsTool(id) {
  let content = "# VitePress MCP 智能检索 — 方案对比\n\n";

  for (const [key, sol] of Object.entries(SOLUTIONS)) {
    content += `## ${sol.name}\n\n`;
    content += `${sol.description}\n\n`;

    if (sol.tools) {
      content += `**支持的工具**: ${sol.tools.join(" / ")}\n\n`;
    }

    content += "**优势**:\n";
    content += sol.advantages.map((a) => `- ${a}`).join("\n");
    content += `\n\n详细文档: ${sol.link}\n\n`;
  }

  content += "---\n\n";
  content += "**推荐**：先完成方案一（MCP），快速为外部 AI 工具提供文档检索能力；再按需扩展方案二（Go RAG）实现网页端 AI 问答。";

  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: content }],
    },
  };
}

// ============ MCP Request Router ============

async function handleMCPRequest(request) {
  const { method } = request;

  switch (method) {
    case "initialize":
      return handleInitialize(request);
    case "ping":
      return handlePing(request);
    case "tools/list":
      return handleToolsList(request);
    case "tools/call":
      return await handleToolsCall(request);
    case "notifications/initialized":
      // Notification (no id), no response needed
      return null;
    default:
      return createErrorResponse(
        request.id,
        -32601,
        `Method not found: ${method}`
      );
  }
}

// ============ Request Handler (EdgeOne Pages Cloud Function) ============

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // GET - Server info (心跳探测/服务发现)
  // 设置 60s 缓存以大幅降低高频心跳导致的请求次数消耗
  if (method === "GET") {
    return jsonResponse(200, {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      description:
        "MCP server for VitePress MCP 智能检索 documentation. Use POST method to interact.",
      protocolVersion: SUPPORTED_PROTOCOL_VERSION,
      availableTools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    }, {
      "Cache-Control": "public, max-age=60",
    });
  }

  // DELETE - Session termination
  if (method === "DELETE") {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  // POST - Main MCP message endpoint
  if (method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return jsonResponse(
        415,
        createErrorResponse(null, -32700, "Content-Type must be application/json")
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse(
        400,
        createErrorResponse(null, -32700, "Parse error: Invalid JSON")
      );
    }

    const acceptHeader = request.headers.get("accept") || "";
    const useSSE = acceptHeader.includes("text/event-stream");

    // 分级日志：仅记录有实际意义的请求，过滤掉协议握手和心跳噪音
    const logMethod = Array.isArray(body)
      ? body.map((r) => r.method).join(", ")
      : body.method;
    const silentMethods = ["initialize", "ping", "notifications/initialized"];
    if (!silentMethods.includes(logMethod)) {
      console.log(`[MCP] POST ${logMethod}`);
    }

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = [];
      for (const mcpReq of body) {
        const result = await handleMCPRequest(mcpReq);
        if (result !== null) {
          results.push(result);
        }
      }

      if (results.length === 0) {
        return new Response(null, {
          status: 202,
          headers: CORS_HEADERS,
        });
      }

      if (useSSE) {
        return sseResponse(results);
      } else {
        return jsonResponse(200, results);
      }
    }

    // Handle single request
    const result = await handleMCPRequest(body);

    if (result === null) {
      // Notification - no response needed
      return new Response(null, {
        status: 202,
        headers: CORS_HEADERS,
      });
    }

    if (useSSE) {
      return sseResponse(result);
    } else {
      return jsonResponse(200, result);
    }
  }

  // Method not allowed
  return jsonResponse(405, createErrorResponse(null, -32600, "Method not allowed"));
}
