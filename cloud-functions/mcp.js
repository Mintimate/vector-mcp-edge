const SERVER_NAME = 'vector-mcp-edge-knowledge-mcp'
const SERVER_VERSION = '3.0.0'
const PROTOCOL_VERSION = '2025-03-26'

const PROJECT_INFO = `# Vector MCP Edge

Vector MCP Edge is a tutorial and runnable demo for adding semantic documentation search to a VitePress site.

- CNB knowledge base chunks and vectorizes Markdown documents.
- EdgeOne Makers Node Cloud Function exposes the standard /mcp endpoint.
- EdgeOne Makers hosted Agent provides /chat conversations and /stop cancellation.
- Makers AI Gateway and Store provide model access and persistent sessions.

Repository: https://cnb.cool/shenzhen/lecturer/vector-mcp-edge
Documentation: https://vector-mcp-edge.mintimate.cn/`

const QUICKSTART = `# Quick Start

1. Host the Markdown repository on CNB and enable the knowledge-base pipeline.
2. Declare AI_GATEWAY_* and CNB_KNOWLEDGE_BASE_* in .env.example.
3. Configure the CNB URL and token with edgeone makers env set.
4. Run PAGES_SOURCE=skills edgeone makers dev.
5. Deploy with PAGES_SOURCE=skills edgeone makers deploy.
6. Connect external AI clients to https://<domain>/mcp.
7. Call POST /chat with a makers-conversation-id header.`

const SOLUTIONS = `# Solution Overview

The current EdgeOne Makers architecture uses a path-level Node Cloud Function for MCP and a hosted Agent for model inference, knowledge retrieval, SSE, sessions, and cancellation. Both share the same CNB knowledge base.

Archived approaches include JS-only MCP, self-hosted Go RAG, and a catch-all Go Function with browser-orchestrated Tool Calling.`

const tools = [
  {
    name: 'query_knowledge_base',
    description: 'Search the VitePress MCP documentation knowledge base using semantic vector search. Use this for EdgeOne Makers, hosted Agents, CNB knowledge bases, VitePress, MCP, configuration, and deployment workflows.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural-language search query in Chinese or English.' },
        keyword: { type: 'string', description: 'Optional semicolon-separated keywords.' },
        top_k: { type: 'number', description: 'Maximum results (default 5, range 1-10).' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_project_info',
    description: 'Get the current Vector MCP Edge architecture, purpose, and links.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_quickstart',
    description: 'Get the current EdgeOne Makers quick-start guide.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_solutions',
    description: 'Compare the current Makers MCP + hosted Agent architecture with legacy solutions.',
    inputSchema: { type: 'object', properties: {} }
  }
]

export async function onRequest(context) {
  const request = context.request
  if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }))
  if (request.method === 'GET') {
    return json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: 'MCP server for VitePress MCP smart search. Use POST to interact.',
      protocolVersion: PROTOCOL_VERSION,
      availableTools: tools.map(({ name, description }) => ({ name, description }))
    }, 200, { 'Cache-Control': 'public, max-age=60' })
  }
  if (request.method === 'DELETE') return withCors(new Response(null, { status: 200 }))
  if (request.method !== 'POST') return json(rpcError(null, -32600, 'Method not allowed'), 405)

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(rpcError(null, -32700, 'Content-Type must be application/json'), 415)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json(rpcError(null, -32700, 'Parse error: Invalid JSON'), 400)
  }

  const useSSE = request.headers.get('accept')?.includes('text/event-stream')
  if (Array.isArray(payload)) {
    const results = (await Promise.all(payload.map(item => dispatch(item, context.env)))).filter(Boolean)
    if (!results.length) return withCors(new Response(null, { status: 202 }))
    return useSSE ? sse(results) : json(results)
  }

  const result = await dispatch(payload, context.env)
  if (!result) return withCors(new Response(null, { status: 202 }))
  return useSSE ? sse([result]) : json(result)
}

async function dispatch(request, env) {
  switch (request?.method) {
    case 'initialize':
      return rpcOK(request.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION }
      })
    case 'ping':
      return rpcOK(request.id, {})
    case 'tools/list':
      return rpcOK(request.id, { tools })
    case 'tools/call':
      return callTool(request.id, request.params, env)
    case 'notifications/initialized':
      return null
    default:
      return rpcError(request?.id ?? null, -32601, `Method not found: ${request?.method ?? ''}`)
  }
}

async function callTool(id, params, env) {
  const name = params?.name
  const args = params?.arguments ?? {}
  if (name === 'get_project_info') return rpcOK(id, textContent(PROJECT_INFO))
  if (name === 'get_quickstart') return rpcOK(id, textContent(QUICKSTART))
  if (name === 'get_solutions') return rpcOK(id, textContent(SOLUTIONS))
  if (name !== 'query_knowledge_base') return rpcError(id, -32602, `Unknown tool: ${name}`)
  if (typeof args.query !== 'string' || !args.query.trim()) {
    return rpcError(id, -32602, 'Missing required parameter: query')
  }

  try {
    const content = await queryKnowledgeBase(args, env)
    return rpcOK(id, textContent(content || 'No results found for the given query.'))
  } catch (error) {
    return rpcOK(id, { ...textContent(`Error querying knowledge base: ${error.message}`), isError: true })
  }
}

async function queryKnowledgeBase(args, env) {
  const url = env.CNB_KNOWLEDGE_BASE_URL || env.KNOWLEDGE_API_URL
  const token = env.CNB_KNOWLEDGE_BASE_TOKEN || env.CNB_TOKEN
  if (!url || !token) throw new Error('CNB knowledge-base environment variables are missing')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      query: args.query,
      ...(args.keyword ? { keyword: args.keyword } : {}),
      top_k: clampTopK(args.top_k)
    })
  })
  if (!response.ok) throw new Error(`knowledge API ${response.status}: ${await response.text()}`)
  return formatKnowledgePayload(await response.json())
}

function formatKnowledgePayload(payload) {
  const items = collectItems(payload)
  if (!items.length) return JSON.stringify(payload, null, 2)
  return items.map((item, index) => {
    const metadata = isRecord(item.metadata) ? item.metadata : {}
    const title = firstString(metadata, ['name', 'title', 'path']) || 'Untitled'
    const content = firstString(item, ['chunk', 'content', 'text', 'pageContent', 'page_content']) || JSON.stringify(item)
    const score = typeof item.score === 'number' ? ` (relevance: ${item.score.toFixed(3)})` : ''
    const source = firstString(metadata, ['url', 'source'])
    return `## ${index + 1}. ${title}${score}\n\n${content}${source ? `\nSource: ${source}` : ''}`
  }).join('\n\n---\n\n')
}

function collectItems(value) {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return []
  for (const key of ['data', 'results', 'documents', 'chunks', 'items', 'list']) {
    if (Array.isArray(value[key])) return value[key]
    const nested = collectItems(value[key])
    if (nested.length) return nested
  }
  return [value]
}

function clampTopK(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(1, Math.min(10, Math.floor(number))) : 5
}

function firstString(value, keys) {
  for (const key of keys) if (typeof value?.[key] === 'string' && value[key]) return value[key]
  return ''
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function rpcOK(id, result) {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

function textContent(text) {
  return { content: [{ type: 'text', text }] }
}

function json(body, status = 200, extraHeaders = {}) {
  return withCors(Response.json(body, { status, headers: extraHeaders }))
}

function sse(items) {
  const body = items.map(item => `event: message\ndata: ${JSON.stringify(item)}\n\n`).join('')
  return withCors(new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  }))
}

function withCors(response) {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Mcp-Session-Id')
  headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id')
  return new Response(response.body, { status: response.status, headers })
}
