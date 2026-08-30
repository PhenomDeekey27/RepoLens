import { AIProvider, AICompletionRequest, AICompletionResponse } from '../base';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  contextLimit: number;
  outputLimit: number;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiGenerateRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
      role?: string;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async generate(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || this.config.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const contents: GeminiContent[] = [];
    for (const msg of request.messages) {
      if (msg.role === 'system') {
        contents.push({ role: 'user', parts: [{ text: `[System Instructions]\n${msg.content}` }] });
        contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
      } else if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }

    const body: GeminiGenerateRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.3,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (request.responseFormat?.type === 'json_object') {
      body.generationConfig!.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const data: GeminiGenerateResponse = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    return {
      content: text,
      model,
      provider: this.name,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount ?? 0,
            outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined,
    };
  }

  getModelInfo(_modelUsed: string) {
    return {
      contextLimit: this.config.contextLimit,
      outputLimit: this.config.outputLimit,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}
