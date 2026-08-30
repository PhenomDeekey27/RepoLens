import { ProviderName } from './providers/registry';

export type ScoreLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ModelEntry {
  id: string;
  provider: ProviderName;
  model: string;
  free: boolean;
  codingScore: ScoreLevel;
  reasoningScore: ScoreLevel;
  speedScore: ScoreLevel;
  contextWindow: number;
  longContextScore: ScoreLevel;
  structuredOutput: boolean;
  recommendedFor: string[];
}

function s(level: ScoreLevel): ScoreLevel { return level; }

export const MODEL_REGISTRY: ModelEntry[] = [
  // ── OpenCode Zen Free Models ──
  {
    id: 'opencode/nemotron-3-ultra-free',
    provider: 'opencode',
    model: 'nemotron-3-ultra-free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(5),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(5),
    structuredOutput: true,
    recommendedFor: ['repository_analysis', 'debugging', 'complex_reasoning', 'agentic_coding'],
  },
  {
    id: 'opencode/nemotron-3.5-lightning-free',
    provider: 'opencode',
    model: 'nemotron-3.5-lightning-free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(3),
    speedScore: s(5),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'classification', 'fast_generation', 'evidence_extraction'],
  },
  {
    id: 'opencode/mimo-v2.5-free',
    provider: 'opencode',
    model: 'mimo-v2.5-free',
    free: true,
    codingScore: s(5),
    reasoningScore: s(5),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(4),
    structuredOutput: true,
    recommendedFor: ['code_generation', 'patch_generation', 'complex_reasoning', 'debugging'],
  },
  {
    id: 'opencode/hy3-free',
    provider: 'opencode',
    model: 'hy3-free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(4),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'fast_generation'],
  },
  {
    id: 'opencode/ling-3.0-flash-fin-free',
    provider: 'opencode',
    model: 'ling-3.0-flash-fin-free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(4),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'classification', 'fast_generation'],
  },
  {
    id: 'opencode/big-pickle',
    provider: 'opencode',
    model: 'big-pickle',
    free: true,
    codingScore: s(4),
    reasoningScore: s(4),
    speedScore: s(2),
    contextWindow: 128_000,
    longContextScore: s(4),
    structuredOutput: true,
    recommendedFor: ['complex_reasoning', 'debugging', 'code_generation'],
  },
  {
    id: 'opencode/muse-spark-1.2-contributor-free',
    provider: 'opencode',
    model: 'muse-spark-1.2-contributor-free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'general'],
  },

  // ── OpenRouter Free Models ──
  {
    id: 'openrouter/nvidia/nemotron-3-ultra:free',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3-ultra:free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(5),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(5),
    structuredOutput: true,
    recommendedFor: ['repository_analysis', 'debugging', 'complex_reasoning'],
  },
  {
    id: 'openrouter/nvidia/nemotron-3.5-lightning:free',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3.5-lightning:free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(3),
    speedScore: s(5),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'classification', 'fast_generation'],
  },
  {
    id: 'openrouter/nvidia/nemotron-3-super:free',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3-super:free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(4),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(4),
    structuredOutput: true,
    recommendedFor: ['debugging', 'complex_reasoning', 'code_generation'],
  },
  {
    id: 'openrouter/minimax/minimax-m2.7:free',
    provider: 'openrouter',
    model: 'minimax/minimax-m2.7:free',
    free: true,
    codingScore: s(4),
    reasoningScore: s(4),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(4),
    structuredOutput: true,
    recommendedFor: ['code_generation', 'patch_generation', 'complex_reasoning'],
  },
  {
    id: 'openrouter/inclusionai/ling-3.0-flash-fin:free',
    provider: 'openrouter',
    model: 'inclusionai/ling-3.0-flash-fin:free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(4),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'fast_generation'],
  },
  {
    id: 'openrouter/thinking-machines/inkling:free',
    provider: 'openrouter',
    model: 'thinking-machines/inkling:free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(4),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['debugging', 'reasoning'],
  },
  {
    id: 'openrouter/dots-studio/dots3-note-preview:free',
    provider: 'openrouter',
    model: 'dots-studio/dots3-note-preview:free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['simple_coding', 'general'],
  },
  {
    id: 'openrouter/liquid/lfm2.5-2.6b:free',
    provider: 'openrouter',
    model: 'liquid/lfm2.5-2.6b:free',
    free: true,
    codingScore: s(2),
    reasoningScore: s(2),
    speedScore: s(5),
    contextWindow: 32_000,
    longContextScore: s(1),
    structuredOutput: false,
    recommendedFor: ['very_simple', 'fast_generation'],
  },
  {
    id: 'openrouter/free',
    provider: 'openrouter',
    model: 'openrouter/free',
    free: true,
    codingScore: s(3),
    reasoningScore: s(3),
    speedScore: s(3),
    contextWindow: 128_000,
    longContextScore: s(3),
    structuredOutput: true,
    recommendedFor: ['general', 'fallback'],
  },

  // ── Z.AI / GLM ──
  {
    id: 'zai/glm-4-flash',
    provider: 'zai',
    model: process.env.ZAI_MODEL || 'glm-4-flash',
    free: true,
    codingScore: s(4),
    reasoningScore: s(4),
    speedScore: s(4),
    contextWindow: 128_000,
    longContextScore: s(4),
    structuredOutput: true,
    recommendedFor: ['code_generation', 'debugging', 'complex_reasoning', 'patch_generation'],
  },

  // ── DeepSeek (paid) ──
  {
    id: 'deepseek/deepseek-v4-flash',
    provider: 'deepseek',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
    free: false,
    codingScore: s(5),
    reasoningScore: s(5),
    speedScore: s(4),
    contextWindow: 131_072,
    longContextScore: s(5),
    structuredOutput: true,
    recommendedFor: ['code_generation', 'patch_generation', 'complex_reasoning', 'debugging', 'repository_analysis'],
  },

  // ── Gemini (emergency fallback) ──
  {
    id: 'gemini/gemini-2.5-flash',
    provider: 'gemini',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    free: false,
    codingScore: s(4),
    reasoningScore: s(4),
    speedScore: s(4),
    contextWindow: 1_048_576,
    longContextScore: s(5),
    structuredOutput: true,
    recommendedFor: ['large_repository_analysis', 'long_context', 'emergency_fallback'],
  },
];

export function getModelById(id: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

export function getModelsByProvider(provider: ProviderName): ModelEntry[] {
  return MODEL_REGISTRY.filter((m) => m.provider === provider);
}

export function getFreeModels(): ModelEntry[] {
  return MODEL_REGISTRY.filter((m) => m.free);
}
