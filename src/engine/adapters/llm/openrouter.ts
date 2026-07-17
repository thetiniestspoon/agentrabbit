import type { LLMAdapter, LLMMessage, LLMResponse, LLMCallOptions } from './types.js';

export interface OpenRouterAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export class OpenRouterAdapter implements LLMAdapter {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(options: OpenRouterAdapterOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.defaultModel = options.defaultModel ?? 'anthropic/claude-sonnet-4-6-20250514';
  }

  formatRequest(messages: LLMMessage[], options: LLMCallOptions) {
    return {
      model: options.model ?? this.defaultModel,
      max_tokens: options.maxTokens ?? 4096,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    };
  }

  async call(messages: LLMMessage[], options: LLMCallOptions = {}): Promise<LLMResponse> {
    const body = this.formatRequest(messages, options);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }

    const data = await response.json() as Record<string, any>;
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? '',
      model: data.model ?? body.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }
}
