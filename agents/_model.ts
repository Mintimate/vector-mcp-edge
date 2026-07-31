import OpenAI from 'openai';
import { OpenAIChatCompletionsModel } from '@openai/agents';

const DEFAULT_MODEL = '@makers/deepseek-v4-flash';

export interface AgentEnv {
  AI_GATEWAY_API_KEY: string;
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_MODEL?: string;
  CNB_KNOWLEDGE_BASE_URL: string;
  CNB_KNOWLEDGE_BASE_TOKEN: string;
}

export function getAgentEnv(source: Record<string, string | undefined> | undefined): AgentEnv {
  const env = source ?? {};
  const knowledgeUrl = env.CNB_KNOWLEDGE_BASE_URL || env.KNOWLEDGE_API_URL;
  const knowledgeToken = env.CNB_KNOWLEDGE_BASE_TOKEN || env.CNB_TOKEN;
  const missing = [
    !env.AI_GATEWAY_API_KEY?.trim() && 'AI_GATEWAY_API_KEY',
    !env.AI_GATEWAY_BASE_URL?.trim() && 'AI_GATEWAY_BASE_URL',
    !knowledgeUrl?.trim() && 'CNB_KNOWLEDGE_BASE_URL',
    !knowledgeToken?.trim() && 'CNB_KNOWLEDGE_BASE_TOKEN',
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    AI_GATEWAY_API_KEY: env.AI_GATEWAY_API_KEY!,
    AI_GATEWAY_BASE_URL: env.AI_GATEWAY_BASE_URL!.trim().replace(/\/chat\/completions\/?$/, ''),
    AI_GATEWAY_MODEL: env.AI_GATEWAY_MODEL,
    CNB_KNOWLEDGE_BASE_URL: knowledgeUrl!,
    CNB_KNOWLEDGE_BASE_TOKEN: knowledgeToken!,
  };
}

export function createGatewayModel(env: AgentEnv) {
  const client = new OpenAI({
    apiKey: env.AI_GATEWAY_API_KEY,
    baseURL: env.AI_GATEWAY_BASE_URL,
  });
  return new OpenAIChatCompletionsModel(client, env.AI_GATEWAY_MODEL || DEFAULT_MODEL);
}
