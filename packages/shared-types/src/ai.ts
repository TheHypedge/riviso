/**
 * AI & LLM types
 */

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

export interface MessageMetadata {
  tokensUsed?: number;
  dataSourcesQueried?: string[];
  processingTime?: number;
  confidence?: number;
}

export interface AiChatSession {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  messages: AiChatMessage[];
  context: SessionContext;
  createdAt: string;
  updatedAt: string;
}

export interface SessionContext {
  workspaceId: string;
  projectId?: string;
  availableDataSources: string[];
  preferences?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AiPromptRequest {
  message: string;
  sessionId?: string;
  context?: SessionContext;
  stream?: boolean;
}

export interface AiPromptResponse {
  message: string;
  sessionId: string;
  confidence?: number;
  reasoning?: string;
  dataUsed?: DataReference[];
  suggestions?: string[];
  visualizations?: Visualization[];
  metadata?: {
    intentType?: string;
    intentConfidence?: number;
    dataSourcesQueried?: string[];
    totalRecords?: number;
    processingTime?: number;
  };
}

export interface DataReference {
  source: string;
  type: string;
  summary: string;
  link?: string;
}

export interface Visualization {
  type: 'chart' | 'table' | 'metric';
  data: any;
  config: any;
}

export enum LlmProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  CUSTOM = 'custom',
}

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  description: string;
}
