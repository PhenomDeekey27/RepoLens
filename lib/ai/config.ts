import { ProviderName } from './providers/registry';
import { MODEL_REGISTRY, ModelEntry, getModelById } from './model-registry';
import { isProviderConfigured } from './providers/registry';

export { getModelById };

export type AnalysisTask =
  | 'relevant_file_discovery'
  | 'root_cause_analysis'
  | 'evidence_extraction'
  | 'solution_generation'
  | 'patch_generation';

export interface TaskModelEntry {
  provider: ProviderName;
  model: string;
}

export type TaskType =
  | 'simple_coding'
  | 'complex_debugging'
  | 'large_repository_analysis'
  | 'code_generation'
  | 'evidence_extraction'
  | 'general';

const TASK_TYPE_MAP: Record<AnalysisTask, TaskType> = {
  relevant_file_discovery: 'simple_coding',
  root_cause_analysis: 'complex_debugging',
  evidence_extraction: 'evidence_extraction',
  solution_generation: 'code_generation',
  patch_generation: 'code_generation',
};

interface TaskWeights {
  coding: number;
  reasoning: number;
  speed: number;
  longContext: number;
}

const TASK_WEIGHTS: Record<TaskType, TaskWeights> = {
  simple_coding: { coding: 3, reasoning: 1, speed: 3, longContext: 1 },
  complex_debugging: { coding: 2, reasoning: 3, speed: 1, longContext: 2 },
  large_repository_analysis: { coding: 1, reasoning: 2, speed: 1, longContext: 3 },
  code_generation: { coding: 3, reasoning: 2, speed: 1, longContext: 2 },
  evidence_extraction: { coding: 2, reasoning: 1, speed: 3, longContext: 1 },
  general: { coding: 1, reasoning: 2, speed: 2, longContext: 1 },
};

function scoreModel(model: ModelEntry, weights: TaskWeights, requiredContext: number): number {
  if (model.contextWindow < requiredContext) return -1;

  const w = weights;
  const norm = w.coding + w.reasoning + w.speed + w.longContext;

  return (
    (model.codingScore * w.coding +
      model.reasoningScore * w.reasoning +
      model.speedScore * w.speed +
      model.longContextScore * w.longContext) /
    norm
  );
}

function getAvailableModels(requiredContext: number): ModelEntry[] {
  return MODEL_REGISTRY.filter(
    (m) => isProviderConfigured(m.provider) && m.contextWindow >= requiredContext
  );
}

function rankModels(
  taskType: TaskType,
  requiredContext: number,
  excludeModels: Set<string> = new Set()
): Array<{ entry: ModelEntry; score: number }> {
  const weights = TASK_WEIGHTS[taskType];
  const available = getAvailableModels(requiredContext);

  const scored = available
    .filter((m) => !excludeModels.has(m.id))
    .map((m) => ({ entry: m, score: scoreModel(m, weights, requiredContext) }))
    .filter((m) => m.score >= 0)
    .sort((a, b) => {
      if (a.entry.free !== b.entry.free) return a.entry.free ? -1 : 1;
      return b.score - a.score;
    });

  return scored;
}

const ROOT_CAUSEPreferred_MODELS: TaskModelEntry[] = [
  // Qwen3 Coder 480B A35B first for root cause analysis
  { provider: 'openrouter', model: 'qwen/qwen3-coder-plus' },
  // Then other strong models
  { provider: 'openrouter', model: 'moonshotai/kimi-k2.5' },
  { provider: 'openrouter', model: 'moonshotai/kimi-k2-thinking' },
  { provider: 'openrouter', model: 'qwen/qwen3-coder' },
  { provider: 'openrouter', model: 'qwen/qwen3-coder-30b-a3b-instruct' },
  { provider: 'openrouter', model: 'z-ai/glm-5.2' },
];

export function selectModelsForTask(
  task: string,
  estimatedTokens: number = 0,
  excludeModels: Set<string> = new Set()
): TaskModelEntry[] {
  // Special handling for root_cause_analysis - use preferred OpenRouter models first
  if (task === 'root_cause_analysis') {
    const preferred = ROOT_CAUSEPreferred_MODELS.filter(
      (m) => !excludeModels.has(`${m.provider}/${m.model}`)
    );
    const ranked = rankModels('complex_debugging', Math.max(estimatedTokens * 2, 32_000), excludeModels);
    const remaining = ranked.filter(
      (r) => !preferred.some((p) => p.provider === r.entry.provider && p.model === r.entry.model)
    );
    return [
      ...preferred,
      ...remaining.map((r) => ({ provider: r.entry.provider, model: r.entry.model })),
    ];
  }

  const taskType = TASK_TYPE_MAP[task as AnalysisTask] || 'general';
  const requiredContext = Math.max(estimatedTokens * 2, 32_000);
  const ranked = rankModels(taskType, requiredContext, excludeModels);

  if (ranked.length === 0) {
    console.warn(`[config] No models available for task ${task} (context: ${requiredContext}), falling back to all configured models`);
    const allAvailable = MODEL_REGISTRY.filter((m) => isProviderConfigured(m.provider) && !excludeModels.has(m.id));
    return allAvailable.map((m) => ({ provider: m.provider, model: m.model }));
  }

  return ranked.map((r) => ({ provider: r.entry.provider, model: r.entry.model }));
}

export function getTaskModelChain(task: string): TaskModelEntry[] {
  return selectModelsForTask(task);
}

export function getTestFailProvider(): string | null {
  return process.env.AI_TEST_FAIL_PROVIDER || null;
}
