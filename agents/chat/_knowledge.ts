import { tool } from '@openai/agents';
import { z } from 'zod';
import type { AgentEnv } from '../_model';
import { truncateText } from '../_shared';

interface KnowledgeHit {
  title?: string;
  url?: string;
  content: string;
  score?: number;
}

export function createKnowledgeTool(env: AgentEnv, signal?: AbortSignal) {
  return tool({
    name: 'query_knowledge_base',
    description:
      'Search the vector-mcp-edge documentation knowledge base. Use this before answering factual questions about this project, CNB knowledge bases, MCP, EdgeOne Makers, deployment, or configuration.',
    parameters: z.object({
      query: z.string().min(2).max(500).describe('A focused documentation search query in Chinese or English.'),
      top_k: z.number().int().min(1).max(8).optional().describe('Maximum number of results. Defaults to 5.'),
    }),
    async execute({ query, top_k }) {
      const response = await fetch(env.CNB_KNOWLEDGE_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: env.CNB_KNOWLEDGE_BASE_TOKEN,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ query, top_k: top_k ?? 5 }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Knowledge base request failed with HTTP ${response.status}`);
      }

      const payload = await response.json();
      const hits = normalizeKnowledgePayload(payload).slice(0, top_k ?? 5);
      if (!hits.length) return 'No relevant documentation was found.';

      return hits
        .map((hit, index) => {
          const title = hit.title ? `Title: ${hit.title}\n` : '';
          const url = hit.url ? `Source: ${hit.url}\n` : '';
          const score = typeof hit.score === 'number' ? `Score: ${hit.score}\n` : '';
          return `[${index + 1}]\n${title}${url}${score}${truncateText(hit.content, 1800)}`;
        })
        .join('\n\n');
    },
    timeoutMs: 15_000,
    timeoutBehavior: 'error_as_result',
  });
}

function normalizeKnowledgePayload(payload: unknown): KnowledgeHit[] {
  const items = collectItems(payload);
  return items.map(toKnowledgeHit).filter((hit): hit is KnowledgeHit => Boolean(hit?.content.trim()));
}

function collectItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  for (const key of ['data', 'results', 'documents', 'chunks', 'items', 'list']) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested;
    if (isRecord(nested)) {
      const deeper = collectItems(nested);
      if (deeper.length) return deeper;
    }
  }
  return [value];
}

function toKnowledgeHit(value: unknown): KnowledgeHit | null {
  if (!isRecord(value)) return null;
  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const content = firstString(value, ['chunk', 'content', 'text', 'pageContent', 'page_content']);
  if (!content) return null;
  return {
    content,
    title: firstString(metadata, ['name', 'title', 'path']) || firstString(value, ['title', 'name']),
    url: firstString(metadata, ['url', 'source']) || firstString(value, ['url', 'source']),
    score: typeof value.score === 'number' ? value.score : undefined,
  };
}

function firstString(value: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof value[key] === 'string' && value[key]) return value[key] as string;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
