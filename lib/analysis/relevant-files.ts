import { createClient } from '@/lib/supabase/server';
import { runWithFallback, getModels } from '@/lib/ai/model-router';
import { buildRelevantFileContext, RelevantFileContext } from '@/lib/ai/context';
import { deterministicPreFilter } from '@/lib/ai/context/prefilter';
import { validateRelevantFiles, parseAIResponse } from '@/lib/ai/validation';
import { IssueContext, IssueComment, RepositoryFingerprint, RepositoryFileRecord } from '@/types';

async function updateAnalysis(
  analysisId: string,
  updates: {
    status?: string;
    current_stage?: string;
    error_message?: string;
  }
) {
  const supabase = await createClient();
  await supabase.from('analyses').update(updates).eq('id', analysisId);
}

async function storeArtifact(
  analysisId: string,
  artifactType: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase.from('analysis_artifacts').insert({
    analysis_id: analysisId,
    artifact_type: artifactType,
    data,
  });
}

async function getArtifact(
  analysisId: string,
  artifactType: string
): Promise<Record<string, unknown> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('analysis_artifacts')
    .select('data')
    .eq('analysis_id', analysisId)
    .eq('artifact_type', artifactType)
    .single();
  return data?.data || null;
}

async function getRepositoryFiles(analysisId: string): Promise<RepositoryFileRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('repository_files')
    .select('*')
    .eq('analysis_id', analysisId);
  return (data as RepositoryFileRecord[]) || [];
}

async function fetchGitHubFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<{ path: string; content: string; size: number; sha: string } | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) return null;

    const content = await response.text();
    return {
      path,
      content,
      size: content.length,
      sha: response.headers.get('etag') || '',
    };
  } catch {
    return null;
  }
}

export async function runRelevantFileDiscovery(analysisId: string): Promise<void> {
  console.log(`[relevant-files] Starting relevant file discovery for ${analysisId}`);

  try {
    const supabase = await createClient();

    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error('[relevant-files] Analysis not found:', fetchError?.message);
      throw new Error('Analysis not found in database');
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[relevant-files] Session error:', sessionError.message);
      throw new Error('Failed to get authentication session');
    }
    if (!session) {
      console.error('[relevant-files] No session available');
      throw new Error('No active session - please sign in again');
    }
    if (!session.provider_token) {
      console.error('[relevant-files] No provider_token in session. Keys:', Object.keys(session));
      throw new Error('GitHub token not available - please re-authenticate with GitHub');
    }

    const token = session.provider_token;
    const [owner, repo] = analysis.repository_full_name.split('/');

    await updateAnalysis(analysisId, {
      status: 'relevant_file_discovery',
      current_stage: 'relevant_files_discovery',
    });

    const issueContextData = await getArtifact(analysisId, 'issue_context');
    const commentsData = await getArtifact(analysisId, 'issue_comments');
    const fingerprintData = await getArtifact(analysisId, 'fingerprint');

    if (!issueContextData || !fingerprintData) {
      await updateAnalysis(analysisId, {
        status: 'failed',
        error_message: 'Required artifacts not found',
      });
      return;
    }

    const issue = issueContextData as unknown as IssueContext;
    const comments = (commentsData as unknown as { comments: IssueComment[] })?.comments || [];
    const fingerprint = fingerprintData as unknown as RepositoryFingerprint;
    const repositoryFiles = await getRepositoryFiles(analysisId);

    const modelConfig = analysis.model_config as ModelTierConfig | undefined;

    console.log(`[relevant-files] Building deterministic candidates from ${repositoryFiles.length} files`);

    const candidates = deterministicPreFilter(repositoryFiles, issue, fingerprint);
    console.log(`[relevant-files] Deterministic filter produced ${candidates.length} candidates`);

    const tierInfo = getTierInfo('fast', modelConfig);
    const contextLimit = tierInfo.contextLimit;

    const relevantFileContext: RelevantFileContext = {
      issue,
      comments,
      fingerprint,
      files: repositoryFiles.map((f) => ({
        path: f.path,
        language: f.language,
        size: f.size,
        isIgnored: f.is_ignored,
      })),
      contextLimit,
    };

    console.log(`[relevant-files] Building AI context (limit: ${contextLimit})`);

    const builtContext = buildRelevantFileContext(relevantFileContext);
    console.log(`[relevant-files] Estimated tokens: ${builtContext.estimatedTokens}, context reduced: ${builtContext.contextReduced}`);

    console.log(`[relevant-files] Calling ${tierInfo.provider} model: ${tierInfo.model}`);

    const startTime = Date.now();
    const response = await runWithTier({
      tier: 'fast',
      task: 'relevant_file_discovery',
      messages: builtContext.messages,
      temperature: 0.3,
      maxTokens: 2048,
      responseFormat: { type: 'json_object' },
      modelConfig,
    });
    const duration = Date.now() - startTime;

    console.log(`[relevant-files] AI response received in ${duration}ms`);

    const parsedResults = parseAIResponse(response.content);
    console.log(`[relevant-files] Parsed ${parsedResults.length} file results`);

    const { validFiles, rejectedPaths } = validateRelevantFiles(parsedResults, repositoryFiles);
    console.log(`[relevant-files] Validated: ${validFiles.length} valid, ${rejectedPaths.length} rejected`);

    if (rejectedPaths.length > 0) {
      console.log(`[relevant-files] Rejected paths: ${rejectedPaths.join(', ')}`);
    }

    const enrichedFiles = validFiles.map((f) => ({
      ...f,
      reason: parsedResults.find((r) => r.path === f.path)?.reason || '',
      confidence: parsedResults.find((r) => r.path === f.path)?.confidence || f.relevanceScore,
      provider: tierInfo.provider,
      model: tierInfo.model,
      tier: tierInfo.tier,
      source: 'ai' as const,
    }));

    await storeArtifact(analysisId, 'relevant_files', {
      files: enrichedFiles,
      totalCandidates: candidates.length,
      validFiles: enrichedFiles.length,
      rejectedPaths,
      contextReduced: builtContext.contextReduced,
      estimatedTokens: builtContext.estimatedTokens,
      provider: tierInfo.provider,
      model: tierInfo.model,
      tier: tierInfo.tier,
      duration,
      usage: response.usage,
    } as unknown as Record<string, unknown>);

    await updateAnalysis(analysisId, {
      current_stage: 'relevant_files_fetch',
    });

    console.log(`[relevant-files] Fetching ${enrichedFiles.length} files from GitHub`);

    const sourceFiles: Array<{
      path: string;
      content: string;
      size: number;
      language: string;
    }> = [];

    for (const file of enrichedFiles.slice(0, 15)) {
      const fetched = await fetchGitHubFile(token, owner, repo, file.path, 'HEAD');
      if (fetched) {
        sourceFiles.push({
          path: file.path,
          content: fetched.content,
          size: fetched.size,
          language: file.language,
        });
        console.log(`[relevant-files] Fetched ${file.path} (${fetched.size} bytes)`);
      }
    }

    await storeArtifact(analysisId, 'source_files', {
      files: sourceFiles,
      totalFetched: sourceFiles.length,
    } as unknown as Record<string, unknown>);

    await updateAnalysis(analysisId, {
      status: 'relevant_files_ready',
      current_stage: 'relevant_files_complete',
    });

    console.log(`[relevant-files] Discovery complete: ${enrichedFiles.length} relevant files, ${sourceFiles.length} source files fetched`);

  } catch (error) {
    const err = error as Error;
    console.error(`[relevant-files] Discovery failed for ${analysisId}:`, err.message);

    await updateAnalysis(analysisId, {
      status: 'failed',
      error_message: err.message.slice(0, 1000),
    });
  }
}
