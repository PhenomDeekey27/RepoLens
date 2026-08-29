'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AnalysisStepper } from '@/components/analysis/AnalysisStepper';
import { AnalysisHeader } from '@/components/analysis/AnalysisHeader';
import { AnalysisTabContent } from '@/components/analysis/AnalysisTabContent';
import { AnalysisDetailsSidebar } from '@/components/analysis/AnalysisDetailsSidebar';
import { ModelTierPipeline } from '@/components/analysis/ModelTierBadge';
import { ProgressOverlay } from '@/components/analysis/ProgressOverlay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  Analysis,
  AnalysisContext,
  AnalysisRecord,
  AnalysisStageInfo,
  RepositoryFileRecord,
  RelevantFile,
  GitHubUser,
  IssueContext,
  IssueComment,
} from '@/types';

type ActiveTab = 'overview' | 'files' | 'root-cause' | 'evidence' | 'solution' | 'patch';

const STAGE_ORDER = [
  'issue_context',
  'issue_comments',
  'repository_tree',
  'file_filtering',
  'repository_fingerprint',
  'ready',
  'relevant_files_discovery',
  'relevant_files_fetch',
  'relevant_files_complete',
];

function buildStagesFromRecord(record: AnalysisRecord): AnalysisStageInfo[] {
  const currentIdx = STAGE_ORDER.indexOf(record.current_stage);
  const isRelevantDone = record.status === 'relevant_files_ready';

  return [
    { stage: 'REPOSITORY', status: currentIdx >= 2 ? 'completed' : 'pending', label: 'Repository' },
    { stage: 'ISSUE', status: currentIdx >= 1 ? 'completed' : 'pending', label: 'Issue' },
    { stage: 'RELEVANT_FILES', status: isRelevantDone ? 'completed' : currentIdx >= 5 ? 'running' : 'pending', label: 'Relevant Files' },
    { stage: 'ROOT_CAUSE', status: 'pending', label: 'Root Cause' },
    { stage: 'EVIDENCE', status: 'pending', label: 'Evidence' },
    { stage: 'SOLUTION', status: 'pending', label: 'Solution' },
    { stage: 'PATCH', status: 'pending', label: 'Patch' },
  ];
}

function buildAnalysisFromRecord(record: AnalysisRecord, ctx: AnalysisContext | null): Analysis {
  const repo = ctx?.repository || {
    id: record.repository_id,
    name: record.repository_name,
    fullName: record.repository_full_name,
    description: '',
    language: record.fingerprint?.primaryLanguage || '',
    stars: 0,
    forks: 0,
    lastUpdated: record.created_at,
    private: false,
    owner: record.repository_owner,
  };

  const issue = ctx?.issue || {
    id: '',
    number: record.issue_number,
    title: record.issue_title,
    body: '',
    state: 'open' as const,
    labels: [],
    assignees: [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    closedAt: null,
    comments: 0,
    htmlUrl: '',
    userLogin: '',
    repositoryId: record.repository_full_name,
  };

  const uiStatus =
    record.status === 'ready_for_analysis' || record.status === 'relevant_files_ready'
      ? 'completed'
      : record.status === 'failed'
        ? 'failed'
        : record.status === 'completed'
          ? 'completed'
          : 'indexing';

  return {
    id: record.id,
    repository: repo,
    issue,
    status: uiStatus,
    currentStage: 'REPOSITORY',
    stages: buildStagesFromRecord(record),
    relevantFiles: [],
    rootCause: null,
    evidence: null,
    solution: null,
    patch: null,
    startedAt: record.created_at,
    completedAt: record.completed_at,
  };
}

export default function InvestigationPage() {
  const { id: analysisId } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repositoryFiles, setRepositoryFiles] = useState<RepositoryFileRecord[]>([]);
  const [relevantFiles, setRelevantFiles] = useState<RelevantFile[]>([]);
  const [issueContext, setIssueContext] = useState<IssueContext | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [startingDiscovery, setStartingDiscovery] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser?.user_metadata) {
        setUser({
          login: authUser.user_metadata.user_name || authUser.user_metadata.login || 'user',
          name: authUser.user_metadata.full_name || authUser.user_metadata.name || null,
          avatarUrl: authUser.user_metadata.avatar_url || '',
        });
      }
    });
  }, []);

  const storedContext = useMemo<AnalysisContext | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('analysis-selection');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  }, []);

  const analysis = useMemo<Analysis>(() => {
    if (record) return buildAnalysisFromRecord(record, storedContext);
    return buildAnalysisFromRecord(
      {
        id: analysisId,
        user_id: '',
        repository_id: '',
        repository_full_name: storedContext?.repository?.fullName || '',
        repository_owner: storedContext?.repository?.owner || '',
        repository_name: storedContext?.repository?.name || '',
        issue_number: storedContext?.issue?.number || 0,
        issue_title: storedContext?.issue?.title || '',
        status: 'queued',
        current_stage: 'issue_context',
        error_message: null,
        total_files: 0,
        filtered_files: 0,
        fingerprint: null,
        ai_provider: null,
        ai_model: null,
        ai_tier: null,
        ai_tokens_input: null,
        ai_tokens_output: null,
        ai_duration_ms: null,
        model_config: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      storedContext
    );
  }, [record, analysisId, storedContext]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`);
        if (cancelled) return;
        if (response.status === 404) {
          setError('Analysis not found');
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch analysis');
        const data = await response.json();
        if (cancelled) return;
        setRecord(data.analysis);
        setLoading(false);

        if (prevStatusRef.current && prevStatusRef.current !== data.analysis.status) {
          if (data.analysis.status === 'ready_for_analysis') {
            toast.success('Repository index ready!');
          } else if (data.analysis.status === 'relevant_files_ready') {
            toast.success('Relevant files discovered!');
          } else if (data.analysis.status === 'failed') {
            toast.error(data.analysis.error_message || 'Analysis failed');
          }
        }
        prevStatusRef.current = data.analysis.status;
      } catch {
        if (!cancelled) {
          setError('Failed to load analysis');
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [analysisId]);

  useEffect(() => {
    if (!record) return;
    const isRunning = ['queued', 'initializing', 'indexing', 'relevant_file_discovery'].includes(record.status);
    if (!isRunning) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`);
        if (cancelled || !response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        setRecord(data.analysis);

        if (prevStatusRef.current && prevStatusRef.current !== data.analysis.status) {
          if (data.analysis.status === 'ready_for_analysis') {
            toast.success('Repository index ready!');
          } else if (data.analysis.status === 'relevant_files_ready') {
            toast.success('Relevant files discovered!');
          } else if (data.analysis.status === 'failed') {
            toast.error(data.analysis.error_message || 'Analysis failed');
          }
        }
        prevStatusRef.current = data.analysis.status;
      } catch { /* ignore */ }
    };

    pollRef.current = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [record?.status, analysisId]);

  useEffect(() => {
    if (record?.status === 'ready_for_analysis' || record?.status === 'relevant_files_ready') {
      let cancelled = false;
      const load = async () => {
        try {
          const [filesRes, issueRes, commentsRes, relevantRes] = await Promise.all([
            fetch(`/api/analyses/${analysisId}/repository-files`),
            fetch(`/api/analyses/${analysisId}/artifacts/issue_context`),
            fetch(`/api/analyses/${analysisId}/artifacts/issue_comments`),
            fetch(`/api/analyses/${analysisId}/artifacts/relevant_files`),
          ]);
          if (cancelled) return;
          if (filesRes.ok) {
            const data = await filesRes.json();
            setRepositoryFiles(data.files || []);
          }
          if (issueRes.ok) {
            const data = await issueRes.json();
            setIssueContext(data.artifact?.data || null);
          }
          if (commentsRes.ok) {
            const data = await commentsRes.json();
            setComments(data.artifact?.data?.comments || []);
          }
          if (relevantRes.ok) {
            const data = await relevantRes.json();
            setRelevantFiles(data.artifact?.data?.files || []);
          }
        } catch { /* ignore */ }
      };
      load();
      return () => { cancelled = true; };
    }
  }, [record?.status, analysisId]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleStartDiscovery = async () => {
    setStartingDiscovery(true);
    try {
      const response = await fetch(`/api/analyses/${analysisId}/relevant-files`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start discovery');
      }
      toast.success('Starting relevant file discovery...');
      // Refresh the analysis record
      const refreshRes = await fetch(`/api/analyses/${analysisId}`);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setRecord(data.analysis);
      }
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || 'Failed to start discovery');
    } finally {
      setStartingDiscovery(false);
    }
  };

  const isRunning = ['queued', 'initializing', 'indexing', 'relevant_file_discovery'].includes(record?.status || '');
  const isComplete = record?.status === 'ready_for_analysis' || record?.status === 'relevant_files_ready';
  const isFailed = record?.status === 'failed';
  const isDiscoveryReady = record?.status === 'ready_for_analysis' || record?.status === 'failed';

  return (
    <AppShell user={user}>
      <div className="flex h-[calc(100vh-48px)]">
        <div className="w-48 border-r border-outline-variant/50 glass-sidebar p-3 hidden md:block">
          <AnalysisStepper stages={analysis.stages} />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-5 h-5 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
                <span className="text-sm">Loading analysis...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center mb-4">
                <span className="text-error-default text-xl">✕</span>
              </div>
              <p className="text-sm text-on-surface mb-4">{error}</p>
              <Button variant="outline" size="sm" className="border-outline-variant/50 text-on-surface-variant" onClick={() => router.push('/analysis/new')}>
                Start New Analysis
              </Button>
            </div>
          )}

          {!loading && !error && (isRunning || isFailed) && record && (
            <ProgressOverlay record={record} />
          )}

          {!loading && !error && isComplete && record && (
            <>
              <AnalysisHeader analysis={analysis} />

              <div className="mb-6 p-4 rounded-lg glass border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-on-surface">
                    {record.status === 'relevant_files_ready' ? 'Relevant Files Ready' : 'Repository Index Ready'}
                  </span>
                </div>
                {record.fingerprint && (
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant mt-2">
                    {record.fingerprint.primaryLanguage && <span>{record.fingerprint.primaryLanguage}</span>}
                    {record.fingerprint.framework && <span>{record.fingerprint.framework}</span>}
                    {record.fingerprint.packageManager && <span>{record.fingerprint.packageManager}</span>}
                    <span>{record.filtered_files.toLocaleString()} files indexed</span>
                  </div>
                )}
              </div>

              {isDiscoveryReady && (
                <div className="mb-6">
                  <ModelTierPipeline
                    activeTier={record.status === 'relevant_file_discovery' ? 'fast' : null}
                    completedTiers={record.status === 'relevant_files_ready' ? ['fast'] : []}
                    provider={record.ai_provider || 'opencode-zen'}
                    models={{ fast: record.ai_model || '' }}
                  />
                  <div className="mt-3">
                    <Button
                      onClick={handleStartDiscovery}
                      disabled={startingDiscovery}
                      className="gradient-primary text-white hover:gradient-primary-hover font-medium"
                    >
                      {startingDiscovery ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Starting...
                        </span>
                      ) : record?.status === 'failed' ? (
                        'Retry Discovery'
                      ) : (
                        'Start Relevant File Discovery'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['overview', 'files', 'root-cause', 'evidence', 'solution', 'patch'] as ActiveTab[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className={activeTab === tab ? 'bg-primary-container text-on-primary-container font-medium' : 'text-on-surface-variant hover:text-on-surface'}
                  >
                    {tab === 'root-cause' ? 'Root Cause' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>

              <AnalysisTabContent
                activeTab={activeTab}
                analysis={analysis}
                record={record}
                repositoryFiles={repositoryFiles}
                relevantFiles={relevantFiles}
                issueContext={issueContext}
                comments={comments}
              />
            </>
          )}
        </div>

        <AnalysisDetailsSidebar
          analysis={analysis}
          record={record}
          isRunning={isRunning}
          isComplete={isComplete}
          isFailed={isFailed}
        />
      </div>
    </AppShell>
  );
}
