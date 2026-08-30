import { createBackgroundClient } from '@/lib/supabase/background';
import { runWithFallback } from '@/lib/ai/model-router';
import { buildEvidenceContext, EvidenceContext } from '@/lib/ai/context/evidence';
import { validateEvidence, parseEvidenceResponse } from '@/lib/ai/validation/evidence';
import {
  IssueContext,
  IssueComment,
  RepositoryFingerprint,
  RelevantFile,
  RootCauseResult,
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
    console.error('[evidence] Failed to update analysis:', error.message);
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
    console.error('[evidence] Failed to store artifact:', artifactType, error.message);
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
    console.error('[evidence] Failed to fetch artifact:', artifactType, error.message);
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
    console.error('[evidence] Failed to delete downstream artifacts:', error.message);
  }
}

export async function runEvidenceExtraction(analysisId: string): Promise<void> {
  console.log(`[evidence] Starting evidence extraction for ${analysisId}`);

  try {
    const supabase = createBackgroundClient();

    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error('[evidence] Analysis not found:', fetchError?.message);
      throw new Error('Analysis not found in database');
    }

    console.log(`[evidence] Current status: ${analysis.status}, stage: ${analysis.current_stage}`);

    await deleteArtifactsByType(analysisId, ['evidence', 'solution', 'patch']);

    await updateAnalysis(analysisId, {
      status: 'analyzing',
      current_stage: 'evidence_extraction',
      error_message: undefined,
    });

    const issueContextData = await getArtifact(analysisId, 'issue_context');
    const commentsData = await getArtifact(analysisId, 'issue_comments');
    const fingerprintData = await getArtifact(analysisId, 'fingerprint');
    const relevantFilesData = await getArtifact(analysisId, 'relevant_files');
    const sourceFilesData = await getArtifact(analysisId, 'source_files');
    const rootCauseData = await getArtifact(analysisId, 'root_cause');

    console.log(`[evidence] Artifacts found - issue: ${!!issueContextData}, comments: ${!!commentsData}, fingerprint: ${!!fingerprintData}, relevantFiles: ${!!relevantFilesData}, sourceFiles: ${!!sourceFilesData}, rootCause: ${!!rootCauseData}`);

    if (!issueContextData || !fingerprintData || !relevantFilesData || !sourceFilesData || !rootCauseData) {
      console.error('[evidence] Required artifacts missing');
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: 'Required artifacts not found for evidence extraction',
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

    console.log(`[evidence] Building context with ${sourceFiles.length} source files`);

    const evidenceContext: EvidenceContext = {
      issue,
      comments,
      fingerprint,
      relevantFiles,
      sourceFiles,
      rootCause,
    };

    const builtContext = buildEvidenceContext(evidenceContext);
    console.log(`[evidence] Estimated tokens: ${builtContext.estimatedTokens}`);

    const startTime = Date.now();
    const response = await runWithFallback({
      task: 'evidence_extraction',
      messages: builtContext.messages,
      temperature: 0.3,
      maxTokens: 4096,
      responseFormat: { type: 'json_object' },
    });
    const duration = Date.now() - startTime;

    console.log(`[evidence] AI response received in ${duration}ms from model: ${response.model}`);

    const parsedResult = parseEvidenceResponse(response.content);
    console.log(`[evidence] Parsed evidence: status=${parsedResult.status}, ${parsedResult.evidence.length} references`);

    const validationResult = validateEvidence(parsedResult);
    if (!validationResult.valid) {
      console.error('[evidence] Validation failed:', validationResult.error);
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: validationResult.error || 'Evidence validation failed',
      });
      return;
    }

    await storeArtifact(analysisId, 'evidence', {
      status: parsedResult.status,
      description: parsedResult.description,
      reason: parsedResult.reason,
      confidence: parsedResult.confidence,
      evidence: parsedResult.evidence,
      provider: response.provider,
      model: response.model,
      duration,
      usage: response.usage,
    } as unknown as Record<string, unknown>);

    const finalStatus = parsedResult.status === 'no_evidence' ? 'evidence_complete' : 'evidence_complete';
    await updateAnalysis(analysisId, {
      status: finalStatus,
      current_stage: 'evidence_extraction',
      ai_provider: response.provider,
      ai_model: response.model,
      ai_duration_ms: duration,
      ai_tokens_input: response.usage?.inputTokens || 0,
      ai_tokens_output: response.usage?.outputTokens || 0,
    });

    console.log(`[evidence] Evidence extraction complete for ${analysisId} (status: ${parsedResult.status})`);

  } catch (error) {
    const err = error as Error;
    console.error(`[evidence] Extraction failed for ${analysisId}:`, err.message);

    await updateAnalysis(analysisId, {
      status: 'failed',
      error_message: err.message.slice(0, 1000),
    });
  }
}
