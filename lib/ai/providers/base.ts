export type ModelTier = 'fast' | 'balanced' | 'deep';

export interface ModelConfig {
  provider: string;
  model: string;
  tier: ModelTier;
  contextLimit: number;
  outputLimit: number;
  enabled: boolean;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  readonly name: string;
  generate(request: AICompletionRequest): Promise<AICompletionResponse>;
  getModelInfo(model: string): { contextLimit: number; outputLimit: number };
  healthCheck(): Promise<boolean>;
}
