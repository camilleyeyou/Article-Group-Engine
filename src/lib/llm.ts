import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2048;

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a completion from Claude
 */
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? MAX_TOKENS,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  throw new Error('Unexpected response type from Claude');
}

/**
 * Generate a completion with conversation history
 */
export async function generateCompletionWithHistory(
  systemPrompt: string,
  messages: LLMMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens ?? MAX_TOKENS,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  throw new Error('Unexpected response type from Claude');
}

/**
 * Generate a streaming completion from Claude
 */
export async function* generateCompletionStream(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): AsyncGenerator<string> {
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: options?.maxTokens ?? MAX_TOKENS,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJSONResponse<T>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  return JSON.parse(cleaned.trim());
}

export { MODEL, MAX_TOKENS };
