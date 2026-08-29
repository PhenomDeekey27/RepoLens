import { AIProvider, AICompletionRequest, AICompletionResponse } from '../providers/base';
import { OpenCodeZenProvider } from '../providers/opencode';

function getModelFallbackChain(): string[] {
  return [
    process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free',
    process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free',
    process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free',
    process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free',
  ];
}

function createProvider(): AIProvider {
  return new OpenCodeZenProvider({
    apiKey: process.env.OPENCODE_ZEN_API_KEY || '',
    baseUrl: process.env.OPENCODE_ZEN_BASE_URL || 'https://opencode.ai/zen/v1',
    model: '',
    contextLimit: 128000,
    outputLimit: 4096,
  });
}

export interface RunRequest {
  task: string;
  messages: AICompletionRequest['messages'];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: AICompletionRequest['responseFormat'];
}

export async function runWithFallback(request: RunRequest): Promise<AICompletionResponse> {
  const provider = createProvider();
  const models = getModelFallbackChain();
  const lastError = new Error('All models in fallback chain failed');

  for (const model of models) {
    try {
      console.log(`[model-router] Trying model: ${model}`);
      const completion = await provider.generate({
        messages: request.messages,
        model,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        responseFormat: request.responseFormat,
      });
      console.log(`[model-router] Success with model: ${model}`);
      return completion;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[model-router] Model ${model} failed: ${msg}`);
      lastError.message = `Model ${model} failed: ${msg}`;
    }
  }

  throw lastError;
}

export function getModels(): string[] {
  return getModelFallbackChain();
}
