import { Agent, run, type Session } from '@openai/agents';
import { createGatewayModel, getAgentEnv } from '../_model';
import { createSSEResponse, jsonResponse, sseEvent, truncateText } from '../_shared';
import { createKnowledgeTool } from './_knowledge';

const MAX_MESSAGE_CHARS = 12_000;
const MAX_AGENT_TURNS = 3;

const INSTRUCTIONS = `You are the documentation assistant for vector-mcp-edge.

Authoritative current architecture (this overrides stale knowledge-base chunks during migration):
- EdgeOne Pages has been renamed EdgeOne Makers.
- The Node Cloud Function only serves the standard /mcp endpoint and health checks.
- The hosted Agent under agents/chat serves /chat through the Makers AI Gateway.
- Conversation history uses context.store.openaiSession(conversation_id).
- The frontend sends makers-conversation-id and consumes unified SSE events.
- /stop cancels an active run through context.utils.abortActiveRun.

Scope:
- Help users understand and implement CNB knowledge-base vectorization, MCP endpoints, EdgeOne Makers, Makers hosted Agents, VitePress integration, and this repository's deployment workflow.
- For factual, configuration, or deployment questions in scope, call query_knowledge_base at most once per user turn. After the tool returns, answer immediately and never call it again in the same turn.
- Ground the answer in returned documentation. Include source links when the tool returns them.
- If retrieved chunks describe EdgeOne Pages or the old Go RAG / browser Tool Calling architecture, treat them as historical and use the authoritative architecture above for current instructions.
- If no relevant documentation is found, say so clearly instead of inventing configuration.
- Answer in the user's language. Be concise, practical, and use Markdown when it improves readability.
- For unrelated questions, briefly explain that this assistant specializes in vector-mcp-edge and its surrounding stack.`;

export async function onRequest(context: any) {
  const message = typeof context.request?.body?.message === 'string'
    ? context.request.body.message.trim()
    : '';
  const conversationId = context.conversation_id as string | undefined;
  const signal = context.request?.signal as AbortSignal | undefined;

  if (!message) return jsonResponse({ error: "'message' is required" }, 400);
  if (message.length > MAX_MESSAGE_CHARS) return jsonResponse({ error: 'Message exceeds the request limit.' }, 413);
  if (!conversationId) return jsonResponse({ error: "Missing required 'makers-conversation-id' header" }, 400);

  context.tracer?.setAttributes({
    'agent.conversation_id': conversationId,
    'agent.route_path': '/chat',
  });

  return createSSEResponse(async function* () {
    try {
      const env = getAgentEnv(context.env);
      const agent = new Agent({
        name: 'Vector MCP Edge Assistant',
        instructions: INSTRUCTIONS,
        model: createGatewayModel(env),
        modelSettings: {
          parallelToolCalls: false,
          providerData: { chat_template_kwargs: { enable_thinking: true } },
        },
        tools: [createKnowledgeTool(env, signal)],
      });
      const session: Session | undefined = context.store?.openaiSession(conversationId);
      const result = await run(agent, message, {
        stream: true,
        signal,
        session,
        maxTurns: MAX_AGENT_TURNS,
      });

      let usage: Record<string, number | undefined> | null = null;
      for await (const event of result.toStream()) {
        if (signal?.aborted) break;
        const mapped = toSseEvent(event);
        if (mapped) yield sseEvent(mapped);
        usage = extractUsage(event) ?? usage;
      }
      usage = extractUsage(result) ?? usage;
      if (usage) yield sseEvent({ type: 'usage', ...usage });
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError' || signal?.aborted || err.message?.includes('terminated')) return;
      yield sseEvent({ type: 'error_message', content: err.message });
    }
  }, signal);
}

function toSseEvent(event: any): Record<string, unknown> | null {
  if (event.type === 'raw_model_stream_event' && event.data?.type === 'model') {
    const delta = event.data.event?.choices?.[0]?.delta;
    const reasoning = delta?.reasoning_content ?? delta?.reasoning;
    if (typeof reasoning === 'string' && reasoning) {
      return { type: 'reasoning', content: reasoning };
    }
  }
  if (event.type === 'raw_model_stream_event' && event.data?.type === 'output_text_delta') {
    return { type: 'ai_response', content: event.data.delta as string };
  }
  if (event.type === 'run_item_stream_event' && event.name === 'tool_called') {
    const name = event.item?.name ?? event.item?.rawItem?.name;
    return name ? { type: 'tool_call', name } : null;
  }
  if (event.type === 'run_item_stream_event' && event.name === 'tool_output') {
    const name = event.item?.name ?? event.item?.rawItem?.name ?? 'tool';
    const output = event.item?.output ?? event.item?.rawItem?.output;
    return { type: 'tool_result', name, content: truncateText(output, 240) };
  }
  return null;
}

function extractUsage(value: any): Record<string, number | undefined> | null {
  const usage = value?.usage ?? value?.data?.usage ?? value?.item?.rawItem?.usage;
  if (!usage) return null;
  const inputTokens = usage.input_tokens ?? usage.prompt_tokens ?? usage.inputTokens;
  const outputTokens = usage.output_tokens ?? usage.completion_tokens ?? usage.outputTokens;
  const totalTokens = usage.total_tokens ?? usage.totalTokens;
  if (inputTokens === undefined && outputTokens === undefined && totalTokens === undefined) return null;
  return {
    input_tokens: typeof inputTokens === 'number' ? inputTokens : undefined,
    output_tokens: typeof outputTokens === 'number' ? outputTokens : undefined,
    total_tokens: typeof totalTokens === 'number' ? totalTokens : undefined,
  };
}
