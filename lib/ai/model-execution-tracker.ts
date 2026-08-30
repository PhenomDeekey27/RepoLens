import { createBackgroundClient } from '@/lib/supabase/background';

export interface ModelExecutionRecord {
  analysisId: string;
  stage: string;
  provider: string;
  model: string;
  attemptNumber: number;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  success: boolean;
  error: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  fallbackCount: number;
  contextChars: number | null;
  estimatedTokens: number | null;
}

export async function recordModelExecution(record: ModelExecutionRecord): Promise<void> {
  try {
    const supabase = createBackgroundClient();
    const { error } = await supabase.from('analysis_artifacts').insert({
      analysis_id: record.analysisId,
      artifact_type: 'model_execution',
      data: {
        stage: record.stage,
        provider: record.provider,
        model: record.model,
        attemptNumber: record.attemptNumber,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        durationMs: record.durationMs,
        success: record.success,
        error: record.error,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        fallbackCount: record.fallbackCount,
        contextChars: record.contextChars,
        estimatedTokens: record.estimatedTokens,
      },
    });

    if (error) {
      console.warn(`[model-tracker] Failed to record execution (non-fatal): ${error.message}`);
    }
  } catch (err) {
    console.warn(`[model-tracker] Failed to record execution (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getModelExecutions(
  analysisId: string,
  stage?: string
): Promise<ModelExecutionRecord[]> {
  const supabase = createBackgroundClient();
  let query = supabase
    .from('analysis_artifacts')
    .select('data')
    .eq('analysis_id', analysisId)
    .eq('artifact_type', 'model_execution');

  if (stage) {
    query = query.filter('data->>stage', 'eq', stage);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error(`[model-tracker] Failed to fetch executions: ${error.message}`);
    return [];
  }

  return (data || []).map((row) => {
    const d = row.data as Record<string, unknown>;
    return {
      analysisId,
      stage: String(d.stage || ''),
      provider: String(d.provider || ''),
      model: String(d.model || ''),
      attemptNumber: Number(d.attemptNumber || 1),
      startedAt: String(d.startedAt || ''),
      completedAt: d.completedAt ? String(d.completedAt) : null,
      durationMs: d.durationMs != null ? Number(d.durationMs) : null,
      success: Boolean(d.success),
      error: d.error ? String(d.error) : null,
      inputTokens: d.inputTokens != null ? Number(d.inputTokens) : null,
      outputTokens: d.outputTokens != null ? Number(d.outputTokens) : null,
      fallbackCount: Number(d.fallbackCount || 0),
      contextChars: d.contextChars != null ? Number(d.contextChars) : null,
      estimatedTokens: d.estimatedTokens != null ? Number(d.estimatedTokens) : null,
    };
  });
}

export async function getModelExecutionSummary(
  analysisId: string
): Promise<Record<string, ModelExecutionRecord[]>> {
  const all = await getModelExecutions(analysisId);
  const byStage: Record<string, ModelExecutionRecord[]> = {};
  for (const record of all) {
    if (!byStage[record.stage]) byStage[record.stage] = [];
    byStage[record.stage].push(record);
  }
  return byStage;
}

export function logStageStart(
  stage: string,
  analysisId: string,
  sourceFileCount: number,
  sourceChars: number,
  estimatedTokens: number
): void {
  console.log(
    `[${stage}] analysis=${analysisId} sourceFiles=${sourceFileCount} sourceChars=${sourceChars} estimatedTokens=${estimatedTokens}`
  );
}

export function logStageResult(
  stage: string,
  analysisId: string,
  provider: string,
  model: string,
  attempt: number,
  success: boolean,
  duration: number,
  error?: string
): void {
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(
    `[${stage}] ${status} analysis=${analysisId} provider=${provider} model=${model} attempt=${attempt} duration=${duration}ms${error ? ` error=${error}` : ''}`
  );
}
