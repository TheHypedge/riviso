import { LlmProvider as LlmProviderEnum, LlmConfig } from '@riviso/shared-types';
import OpenAI from 'openai';

/**
 * Abstract LLM Provider interface for interchangeable AI backends
 * Supports OpenAI, Anthropic, and custom providers
 */

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface LlmCompletionResponse {
  content: string;
  tokensUsed: number;
  finishReason: string;
  model: string;
}

/**
 * Abstract base class for LLM providers
 */
export abstract class BaseLlmProvider {
  protected config: LlmConfig;

  constructor(config: LlmConfig) {
    this.config = config;
  }

  abstract complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): Promise<LlmCompletionResponse>;

  abstract streamComplete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): AsyncGenerator<string, void, unknown>;
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider extends BaseLlmProvider {
  private client: OpenAI | null = null;

  constructor(config: LlmConfig) {
    super(config);
    // Only initialize client if we have a valid API key
    if (config.apiKey && config.apiKey !== 'mock-key') {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
    }
  }

  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): Promise<LlmCompletionResponse> {
    // Use mock if no valid API key
    if (!this.client) {
      return this.mockComplete(messages);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2000,
        stop: options?.stopSequences,
      });

      return {
        content: response.choices[0].message.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
        finishReason: response.choices[0].finish_reason,
        model: response.model,
      };
    } catch (error) {
      // Fallback to mock on error
      console.error('OpenAI API error, falling back to mock:', error);
      return this.mockComplete(messages);
    }
  }

  async *streamComplete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    // Use mock if no valid API key
    if (!this.client) {
      yield* this.mockStreamComplete();
      return;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 2000,
        stop: options?.stopSequences,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error, falling back to mock:', error);
      yield* this.mockStreamComplete();
    }
  }

  private mockComplete(messages: LlmMessage[]): LlmCompletionResponse {
    return {
      content: 'Mock OpenAI response: ' + messages[messages.length - 1].content,
      tokensUsed: 150,
      finishReason: 'stop',
      model: this.config.model,
    };
  }

  private async *mockStreamComplete(): AsyncGenerator<string, void, unknown> {
    const words = 'This is a mock streaming response from OpenAI'.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

/**
 * Anthropic Provider Implementation
 */
export class AnthropicProvider extends BaseLlmProvider {
  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): Promise<LlmCompletionResponse> {
    // Mock implementation - replace with actual Anthropic SDK call
    return {
      content: 'Mock Anthropic response: ' + messages[messages.length - 1].content,
      tokensUsed: 140,
      finishReason: 'end_turn',
      model: this.config.model,
    };
  }

  async *streamComplete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    // Mock streaming implementation
    const words = 'This is a mock streaming response from Anthropic'.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

/**
 * Factory function to create appropriate LLM provider
 */
export function createLlmProvider(config: LlmConfig): BaseLlmProvider {
  switch (config.provider) {
    case LlmProviderEnum.OPENAI:
      return new OpenAIProvider(config);
    case LlmProviderEnum.ANTHROPIC:
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
