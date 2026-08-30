import { ProviderName } from './providers/registry';

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

export interface TaskConfig {
  preferred: TaskModelEntry;
  fallback: TaskModelEntry[];
}

const DEFAULT_TASK_CONFIG: Record<AnalysisTask, TaskConfig> = {
  relevant_file_discovery: {
    preferred: { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
    fallback: [
      { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' },
      { provider: 'zai', model: process.env.ZAI_MODEL || 'glm-4-flash' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free' },
    ],
  },
  root_cause_analysis: {
    preferred: { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
    fallback: [
      { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' },
      { provider: 'zai', model: process.env.ZAI_MODEL || 'glm-4-flash' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free' },
    ],
  },
  evidence_extraction: {
    preferred: { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
    fallback: [
      { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' },
      { provider: 'zai', model: process.env.ZAI_MODEL || 'glm-4-flash' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free' },
    ],
  },
  solution_generation: {
    preferred: { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' },
    fallback: [
      { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
      { provider: 'zai', model: process.env.ZAI_MODEL || 'glm-4-flash' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free' },
    ],
  },
  patch_generation: {
    preferred: { provider: 'deepseek', model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash' },
    fallback: [
      { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
      { provider: 'zai', model: process.env.ZAI_MODEL || 'glm-4-flash' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_3 || 'mimo-v2.5-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_1 || 'nemotron-3.5-lightning-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_2 || 'ling-3.0-flash-fin-free' },
      { provider: 'opencode', model: process.env.OPENCODE_MODEL_4 || 'muse-spark-1.2-free' },
    ],
  },
};

export function getTaskConfig(task: string): TaskConfig {
  const taskKey = task as AnalysisTask;
  return DEFAULT_TASK_CONFIG[taskKey] || DEFAULT_TASK_CONFIG.relevant_file_discovery;
}

export function getTaskModelChain(task: string): TaskModelEntry[] {
  const config = getTaskConfig(task);
  return [config.preferred, ...config.fallback];
}

export function getTestFailProvider(): string | null {
  return process.env.AI_TEST_FAIL_PROVIDER || null;
}
