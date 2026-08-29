import { NextResponse } from 'next/server';

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  top_provider: {
    max_completion_tokens: number;
  };
  architecture: {
    modality: string;
    tokenizer: string;
  };
}

interface ModelOption {
  id: string;
  name: string;
  contextLength: number;
  maxOutput: number;
  inputPrice: string;
  outputPrice: string;
  isFree: boolean;
  modality: string;
}

export async function GET() {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  const baseUrl = process.env.OPENCODE_ZEN_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const models: OpenRouterModel[] = data.data || [];

    const options: ModelOption[] = models
      .filter((m) => m.architecture?.modality?.includes('text'))
      .map((m) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length,
        maxOutput: m.top_provider?.max_completion_tokens || 4096,
        inputPrice: m.pricing?.prompt || '0',
        outputPrice: m.pricing?.completion || '0',
        isFree:
          m.pricing?.prompt === '0' && m.pricing?.completion === '0',
        modality: m.architecture?.modality || 'unknown',
      }))
      .sort((a, b) => {
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ models: options });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch models: ${error}` },
      { status: 500 }
    );
  }
}
