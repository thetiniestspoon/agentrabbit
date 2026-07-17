import type { LLMAdapter, LLMMessage, LLMResponse, LLMCallOptions } from './types.js';

export interface ClaudeAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export class ClaudeAdapter implements LLMAdapter {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(options: ClaudeAdapterOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.anthropic.com';
    this.defaultModel = options.defaultModel ?? 'claude-sonnet-4-6-20250514';
  }

  formatRequest(messages: LLMMessage[], options: LLMCallOptions) {
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    return {
      model: options.model ?? this.defaultModel,
      max_tokens: options.maxTokens ?? 4096,
      system: systemMessage?.content,
      messages: nonSystemMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    };
  }

  async call(messages: LLMMessage[], options: LLMCallOptions = {}): Promise<LLMResponse> {
    const body = this.formatRequest(messages, options);

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error (${response.status}): ${error}`);
    }

    const data = await response.json() as Record<string, any>;

    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');

    return {
      content: textBlock?.text ?? '',
      model: data.model,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  }
}
