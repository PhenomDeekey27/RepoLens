import { createBackgroundClient } from '@/lib/supabase/background';
import { runWithFallback } from '@/lib/ai/model-router';
import { buildRootCauseContext, RootCauseContext } from '@/lib/ai/context/root-cause';
import { validateRootCause, parseRootCauseResponse } from '@/lib/ai/validation/root-cause';
import {
  IssueContext,
  IssueComment,
  RepositoryFingerprint,
  RelevantFile,
} from '@/types';

async function updateAnalysis(
  analysisId: string,
  updates: {
    status?: string;
    current_stage?: string;
    error_message?: string;
    ai_provider?: string;
    ai_model?: string;
    ai_duration_ms?: number;
    ai_tokens_input?: number;
    ai_tokens_output?: number;
  }
) {
  const supabase = createBackgroundClient();
  const { error } = await supabase.from('analyses').update(updates).eq('id', analysisId);
  if (error) {
    console.error('[root-cause] Failed to update analysis:', error.message);
  }
}

async function storeArtifact(
  analysisId: string,
  artifactType: string,
  data: Record<string, unknown>
) {
  const supabase = createBackgroundClient();
  const { error } = await supabase.from('analysis_artifacts').insert({
    analysis_id: analysisId,
    artifact_type: artifactType,
    data,
  });
  if (error) {
    console.error('[root-cause] Failed to store artifact:', artifactType, error.message);
  }
}

async function getArtifact(
  analysisId: string,
  artifactType: string
): Promise<Record<string, unknown> | null> {
  const supabase = createBackgroundClient();
  const { data, error } = await supabase
    .from('analysis_artifacts')
    .select('data')
    .eq('analysis_id', analysisId)
    .eq('artifact_type', artifactType)
    .single();
  if (error) {
    console.error('[root-cause] Failed to fetch artifact:', artifactType, error.message);
    return null;
  }
  return data?.data || null;
}

async function deleteArtifactsByType(analysisId: string, artifactTypes: string[]) {
  const supabase = createBackgroundClient();
  const { error } = await supabase
    .from('analysis_artifacts')
    .delete()
    .eq('analysis_id', analysisId)
    .in('artifact_type', artifactTypes);
  if (error) {
    console.error('[root-cause] Failed to delete downstream artifacts:', error.message);
  }
}

export async function runRootCauseAnalysis(analysisId: string): Promise<void> {
  console.log(`[root-cause] Starting root cause analysis for ${analysisId}`);

  try {
    const supabase = createBackgroundClient();

    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error('[root-cause] Analysis not found:', fetchError?.message);
      throw new Error('Analysis not found in database');
    }

    console.log(`[root-cause] Current status: ${analysis.status}, stage: ${analysis.current_stage}`);

    await deleteArtifactsByType(analysisId, ['root_cause', 'evidence', 'solution', 'patch']);

    await updateAnalysis(analysisId, {
      status: 'analyzing',
      current_stage: 'root_cause_analysis',
      error_message: undefined,
    });

    const issueContextData = await getArtifact(analysisId, 'issue_context');
    const commentsData = await getArtifact(analysisId, 'issue_comments');
    const fingerprintData = await getArtifact(analysisId, 'fingerprint');
    const relevantFilesData = await getArtifact(analysisId, 'relevant_files');
    const sourceFilesData = await getArtifact(analysisId, 'source_files');

    console.log(`[root-cause] Artifacts found - issue: ${!!issueContextData}, fingerprint: ${!!fingerprintData}, relevantFiles: ${!!relevantFilesData}, sourceFiles: ${!!sourceFilesData}`);

    if (!issueContextData || !fingerprintData || !relevantFilesData || !sourceFilesData) {
      console.error('[root-cause] Required artifacts missing');
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: 'Required artifacts not found for root cause analysis',
      });
      return;
    }

    const issue = issueContextData as unknown as IssueContext;
    const comments = (commentsData as unknown as { comments: IssueComment[] })?.comments || [];
    const fingerprint = fingerprintData as unknown as RepositoryFingerprint;
    const relevantFiles = (relevantFilesData as unknown as { files: RelevantFile[] })?.files || [];
    const sourceFiles = (sourceFilesData as unknown as {
      files: Array<{ path: string; content: string; size: number; language: string }>;
    })?.files || [];

    console.log(`[root-cause] Building context with ${sourceFiles.length} source files`);

    const rootCauseContext: RootCauseContext = {
      issue,
      comments,
      fingerprint,
      relevantFiles,
      sourceFiles,
    };

    const builtContext = buildRootCauseContext(rootCauseContext);
    console.log(`[root-cause] Estimated tokens: ${builtContext.estimatedTokens}`);

    const startTime = Date.now();
    const response = await runWithFallback({
      task: 'root_cause_analysis',
      messages: builtContext.messages,
      temperature: 0.3,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });
    const duration = Date.now() - startTime;

    console.log(`[root-cause] AI response received in ${duration}ms from model: ${response.model}`);

    const parsedResult = parseRootCauseResponse(response.content);
    console.log(`[root-cause] Parsed root cause: confidence ${parsedResult.rootCause.confidence}`);

    const validationResult = validateRootCause(parsedResult);
    if (!validationResult.valid) {
      console.error('[root-cause] Validation failed:', validationResult.error);
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: validationResult.error || 'Root cause validation failed',
      });
      return;
    }

    await storeArtifact(analysisId, 'root_cause', {
      ...parsedResult,
      provider: response.provider,
      model: response.model,
      duration,
      usage: response.usage,
    } as unknown as Record<string, unknown>);

    await updateAnalysis(analysisId, {
      status: 'root_cause_complete',
      current_stage: 'root_cause_analysis',
      ai_provider: response.provider,
      ai_model: response.model,
      ai_duration_ms: duration,
      ai_tokens_input: response.usage?.inputTokens || 0,
      ai_tokens_output: response.usage?.outputTokens || 0,
    });

    console.log(`[root-cause] Root cause analysis complete for ${analysisId}`);

  } catch (error) {
    const err = error as Error;
    console.error(`[root-cause] Analysis failed for ${analysisId}:`, err.message);

    await updateAnalysis(analysisId, {
      status: 'failed',
      error_message: err.message.slice(0, 1000),
    });
  }
}
