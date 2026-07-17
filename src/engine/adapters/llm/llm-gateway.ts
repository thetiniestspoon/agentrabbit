import type { LLMAdapter, LLMMessage, LLMResponse, LLMCallOptions } from './types.js';

export interface LLMGatewayAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

/**
 * Adapter for the LLM Gateway (api.llmgateway.io)
 * OpenAI-compatible API format, same as OpenRouter but pointed at our gateway.
 */
export class LLMGatewayAdapter implements LLMAdapter {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(options: LLMGatewayAdapterOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.llmgateway.io/v1';
    this.defaultModel = options.defaultModel ?? 'gemini-2.5-flash';
  }

  formatRequest(messages: LLMMessage[], options: LLMCallOptions) {
    return {
      model: options.model ?? this.defaultModel,
      max_tokens: options.maxTokens ?? 4096,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
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
      throw new Error(`LLM Gateway error (${response.status}): ${error}`);
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
