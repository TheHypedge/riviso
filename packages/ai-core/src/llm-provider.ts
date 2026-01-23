import { LlmProvider as LlmProviderEnum, LlmConfig } from '@riviso/shared-types';

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
  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): Promise<LlmCompletionResponse> {
    // Mock implementation - replace with actual OpenAI SDK call
    return {
      content: 'Mock OpenAI response: ' + messages[messages.length - 1].content,
      tokensUsed: 150,
      finishReason: 'stop',
      model: this.config.model,
    };
  }

  async *streamComplete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    // Mock streaming implementation
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
