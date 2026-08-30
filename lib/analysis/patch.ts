import { createBackgroundClient } from '@/lib/supabase/background';
import { runWithFallback } from '@/lib/ai/model-router';
import { buildPatchContext, PatchContext } from '@/lib/ai/context/patch';
import { validatePatch, parsePatchResponse } from '@/lib/ai/validation/patch';
import {
  IssueContext,
  IssueComment,
  RepositoryFingerprint,
  RelevantFile,
  RootCauseResult,
  EvidenceResult,
  SolutionResult,
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
    console.error('[patch] Failed to update analysis:', error.message);
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
    console.error('[patch] Failed to store artifact:', artifactType, error.message);
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
    console.error('[patch] Failed to fetch artifact:', artifactType, error.message);
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
    console.error('[patch] Failed to delete downstream artifacts:', error.message);
  }
}

export async function runPatchGeneration(analysisId: string): Promise<void> {
  console.log(`[patch] Starting patch generation for ${analysisId}`);

  try {
    const supabase = createBackgroundClient();

    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error('[patch] Analysis not found:', fetchError?.message);
      throw new Error('Analysis not found in database');
    }

    console.log(`[patch] Current status: ${analysis.status}, stage: ${analysis.current_stage}`);

    await deleteArtifactsByType(analysisId, ['patch']);

    await updateAnalysis(analysisId, {
      status: 'analyzing',
      current_stage: 'patch_generation',
      error_message: undefined,
    });

    const issueContextData = await getArtifact(analysisId, 'issue_context');
    const commentsData = await getArtifact(analysisId, 'issue_comments');
    const fingerprintData = await getArtifact(analysisId, 'fingerprint');
    const relevantFilesData = await getArtifact(analysisId, 'relevant_files');
    const sourceFilesData = await getArtifact(analysisId, 'source_files');
    const rootCauseData = await getArtifact(analysisId, 'root_cause');
    const evidenceData = await getArtifact(analysisId, 'evidence');
    const solutionData = await getArtifact(analysisId, 'solution');

    console.log(`[patch] Artifacts found - issue: ${!!issueContextData}, rootCause: ${!!rootCauseData}, evidence: ${!!evidenceData}, solution: ${!!solutionData}`);

    if (!issueContextData || !fingerprintData || !relevantFilesData || !sourceFilesData || !rootCauseData || !solutionData) {
      console.error('[patch] Required artifacts missing');
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: 'Required artifacts not found for patch generation',
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
    const rootCause = rootCauseData as unknown as RootCauseResult;
    const evidence = evidenceData as unknown as EvidenceResult | null;
    const solution = solutionData as unknown as SolutionResult;

    console.log(`[patch] Building context with ${sourceFiles.length} source files, evidence: ${evidence ? 'present' : 'absent'}`);

    const patchContext: PatchContext = {
      issue,
      comments,
      fingerprint,
      relevantFiles,
      sourceFiles,
      rootCause,
      evidence,
      solution,
    };

    const builtContext = buildPatchContext(patchContext);
    console.log(`[patch] Estimated tokens: ${builtContext.estimatedTokens}`);

    const startTime = Date.now();
    const response = await runWithFallback({
      task: 'patch_generation',
      messages: builtContext.messages,
      temperature: 0.3,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });
    const duration = Date.now() - startTime;

    console.log(`[patch] AI response received in ${duration}ms from model: ${response.model}`);

    const parsedResult = parsePatchResponse(response.content);
    console.log(`[patch] Parsed patch: ${parsedResult.files.length} files`);

    const validationResult = validatePatch(parsedResult);
    if (!validationResult.valid) {
      console.error('[patch] Validation failed:', validationResult.error);
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: validationResult.error || 'Patch validation failed',
      });
      return;
    }

    await storeArtifact(analysisId, 'patch', {
      ...parsedResult,
      provider: response.provider,
      model: response.model,
      duration,
      usage: response.usage,
    } as unknown as Record<string, unknown>);

    await updateAnalysis(analysisId, {
      status: 'completed',
      current_stage: 'completed',
      ai_provider: response.provider,
      ai_model: response.model,
      ai_duration_ms: duration,
      ai_tokens_input: response.usage?.inputTokens || 0,
      ai_tokens_output: response.usage?.outputTokens || 0,
    });

    console.log(`[patch] Patch generation complete for ${analysisId}`);

  } catch (error) {
    const err = error as Error;
    console.error(`[patch] Generation failed for ${analysisId}:`, err.message);

    await updateAnalysis(analysisId, {
      status: 'failed',
      error_message: err.message.slice(0, 1000),
    });
  }
}
