import { createBackgroundClient } from '@/lib/supabase/background';
import {
  IssueContext,
  IssueComment,
  RepositoryFingerprint,
  RelevantFile,
  RootCauseResult,
  EvidenceResult,
  SolutionResult,
} from '@/types';

export interface SourceFile {
  path: string;
  content: string;
  size: number;
  language: string;
  sha?: string;
  lineCount?: number;
}

export interface AnalysisContextData {
  analysisId: string;
  issue: IssueContext;
  comments: IssueComment[];
  fingerprint: RepositoryFingerprint;
  relevantFiles: RelevantFile[];
  sourceFiles: SourceFile[];
  rootCause: RootCauseResult | null;
  evidence: EvidenceResult | null;
  solution: SolutionResult | null;
  previousAttempts: ModelAttempt[];
}

export interface ModelAttempt {
  stage: string;
  provider: string;
  model: string;
  attemptNumber: number;
  success: boolean;
  error?: string;
  duration?: number;
  timestamp: string;
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
    return null;
  }
  return data?.data || null;
}

export async function buildCanonicalContext(analysisId: string): Promise<AnalysisContextData> {
  const supabase = createBackgroundClient();

  const { data: analysis, error: fetchError } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .single();

  if (fetchError || !analysis) {
    throw new Error(`Analysis ${analysisId} not found`);
  }

  const issueContextData = await getArtifact(analysisId, 'issue_context');
  const commentsData = await getArtifact(analysisId, 'issue_comments');
  const fingerprintData = await getArtifact(analysisId, 'fingerprint');
  const relevantFilesData = await getArtifact(analysisId, 'relevant_files');
  const sourceFilesData = await getArtifact(analysisId, 'source_files');
  const rootCauseData = await getArtifact(analysisId, 'root_cause');
  const evidenceData = await getArtifact(analysisId, 'evidence');
  const solutionData = await getArtifact(analysisId, 'solution');

  if (!issueContextData || !fingerprintData) {
    throw new Error(`Required artifacts missing for ${analysisId}: issue=${!!issueContextData}, fingerprint=${!!fingerprintData}`);
  }

  const issue = issueContextData as unknown as IssueContext;
  const comments = (commentsData as unknown as { comments: IssueComment[] })?.comments || [];
  const fingerprint = fingerprintData as unknown as RepositoryFingerprint;
  const relevantFiles = (relevantFilesData as unknown as { files: RelevantFile[] })?.files || [];
  const sourceFiles = (sourceFilesData as unknown as { files: SourceFile[] })?.files || [];
  const rootCause = rootCauseData ? (rootCauseData as unknown as RootCauseResult) : null;
  const evidence = evidenceData ? (evidenceData as unknown as EvidenceResult) : null;
  const solution = solutionData ? (solutionData as unknown as SolutionResult) : null;

  const previousAttempts = extractPreviousAttempts(relevantFilesData, rootCauseData, evidenceData, solutionData);

  return {
    analysisId,
    issue,
    comments,
    fingerprint,
    relevantFiles,
    sourceFiles,
    rootCause,
    evidence,
    solution,
    previousAttempts,
  };
}

function extractPreviousAttempts(
  relevantFilesData: Record<string, unknown> | null,
  rootCauseData: Record<string, unknown> | null,
  evidenceData: Record<string, unknown> | null,
  solutionData: Record<string, unknown> | null
): ModelAttempt[] {
  const attempts: ModelAttempt[] = [];

  const extract = (data: Record<string, unknown> | null, stage: string) => {
    if (!data) return;
    const d = data as Record<string, unknown>;
    if (d.provider && d.model) {
      attempts.push({
        stage,
        provider: String(d.provider),
        model: String(d.model),
        attemptNumber: 1,
        success: true,
        duration: typeof d.duration === 'number' ? d.duration : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  };

  extract(relevantFilesData, 'relevant_file_discovery');
  extract(rootCauseData, 'root_cause_analysis');
  extract(evidenceData, 'evidence_extraction');
  extract(solutionData, 'solution_generation');

  return attempts;
}

export function estimateContextSize(context: AnalysisContextData): {
  issueChars: number;
  commentsChars: number;
  fingerprintChars: number;
  relevantFilesChars: number;
  sourceFilesChars: number;
  rootCauseChars: number;
  evidenceChars: number;
  solutionChars: number;
  totalChars: number;
  estimatedTokens: number;
} {
  const issueChars = context.issue.body.length + context.issue.title.length;
  const commentsChars = context.comments.reduce((sum, c) => sum + c.body.length, 0);
  const fingerprintChars = JSON.stringify(context.fingerprint).length;
  const relevantFilesChars = context.relevantFiles.reduce(
    (sum, f) => sum + f.path.length + (f.description || f.reason || '').length,
    0
  );
  const sourceFilesChars = context.sourceFiles.reduce((sum, f) => sum + f.content.length, 0);
  const rootCauseChars = context.rootCause ? JSON.stringify(context.rootCause).length : 0;
  const evidenceChars = context.evidence ? JSON.stringify(context.evidence).length : 0;
  const solutionChars = context.solution ? JSON.stringify(context.solution).length : 0;

  const totalChars = issueChars + commentsChars + fingerprintChars + relevantFilesChars + sourceFilesChars + rootCauseChars + evidenceChars + solutionChars;

  return {
    issueChars,
    commentsChars,
    fingerprintChars,
    relevantFilesChars,
    sourceFilesChars,
    rootCauseChars,
    evidenceChars,
    solutionChars,
    totalChars,
    estimatedTokens: Math.ceil(totalChars / 4),
  };
}

export function selectSourceFilesForStage(
  context: AnalysisContextData,
  stage: string,
  maxFiles: number = 15,
  maxCharsPerFile: number = 50000
): SourceFile[] {
  const sorted = [...context.sourceFiles].sort((a, b) => {
    const aRelevant = context.relevantFiles.find((f) => f.path === a.path);
    const bRelevant = context.relevantFiles.find((f) => f.path === b.path);
    const aScore = aRelevant?.relevanceScore || 0;
    const bScore = bRelevant?.relevanceScore || 0;
    return bScore - aScore;
  });

  const selected: SourceFile[] = [];
  let totalChars = 0;

  for (const file of sorted) {
    if (selected.length >= maxFiles) break;
    const content = file.content.slice(0, maxCharsPerFile);
    totalChars += content.length;
    selected.push({ ...file, content });
  }

  console.log(`[canonical] Stage ${stage}: selected ${selected.length}/${context.sourceFiles.length} source files, ${totalChars} chars`);

  return selected;
}
