'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AnalysisStepper } from '@/components/analysis/AnalysisStepper';
import { AnalysisHeader } from '@/components/analysis/AnalysisHeader';
import { RelevantFilesPanel } from '@/components/analysis/RelevantFilesPanel';
import { RootCausePanel } from '@/components/analysis/RootCausePanel';
import { EvidencePanel } from '@/components/analysis/EvidencePanel';
import { SolutionPanel } from '@/components/analysis/SolutionPanel';
import { PatchViewer } from '@/components/analysis/PatchViewer';
import { mockAnalysis } from '@/lib/mock/analyses';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Analysis,
  AnalysisContext,
  AnalysisRecord,
  AnalysisStageInfo,
  RepositoryFingerprint,
  RelevantFile,
} from '@/types';

type ActiveTab = 'overview' | 'files' | 'root-cause' | 'evidence' | 'solution' | 'patch';

const STAGE_LABELS: Record<string, string> = {
  issue_context: 'Issue Context',
  issue_comments: 'Issue Comments',
  repository_tree: 'Repository Tree',
  file_filtering: 'File Filtering',
  repository_fingerprint: 'Repository Fingerprint',
  ready: 'Ready',
};

const STAGE_ORDER = [
  'issue_context',
  'issue_comments',
  'repository_tree',
  'file_filtering',
  'repository_fingerprint',
  'ready',
];

function buildStagesFromRecord(record: AnalysisRecord): AnalysisStageInfo[] {
  const currentIdx = STAGE_ORDER.indexOf(record.current_stage);

  return [
    { stage: 'REPOSITORY', status: currentIdx >= 2 ? 'completed' : currentIdx >= 2 ? 'running' : 'pending', label: 'Repository' },
    { stage: 'ISSUE', status: currentIdx >= 1 ? 'completed' : 'pending', label: 'Issue' },
    { stage: 'RELEVANT_FILES', status: record.status === 'ready_for_analysis' ? 'completed' : currentIdx >= 3 ? 'running' : 'pending', label: 'Relevant Files' },
    { stage: 'ROOT_CAUSE', status: 'pending', label: 'Root Cause' },
    { stage: 'EVIDENCE', status: 'pending', label: 'Evidence' },
    { stage: 'SOLUTION', status: 'pending', label: 'Solution' },
    { stage: 'PATCH', status: 'pending', label: 'Patch' },
  ];
}

function buildAnalysisFromRecord(
  record: AnalysisRecord,
  ctx: AnalysisContext | null
): Analysis {
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
    record.status === 'ready_for_analysis'
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

function ProgressOverlay({ record }: { record: AnalysisRecord }) {
  const currentLabel = STAGE_LABELS[record.current_stage] || record.current_stage;
  const stageIdx = STAGE_ORDER.indexOf(record.current_stage);
  const progress = Math.round(((stageIdx + 1) / STAGE_ORDER.length) * 100);

  const statusMessages: Record<string, string> = {
    queued: 'Queued... waiting to start',
    initializing: 'Initializing investigation...',
    indexing: 'Indexing repository...',
    ready_for_analysis: 'Repository index ready!',
    failed: 'Analysis failed',
    completed: 'Analysis complete',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md glass rounded-xl border border-outline-variant/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          {record.status !== 'failed' && record.status !== 'ready_for_analysis' && (
            <div className="w-5 h-5 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
          )}
          {record.status === 'ready_for_analysis' && (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          {record.status === 'failed' && (
            <div className="w-5 h-5 rounded-full bg-error-container flex items-center justify-center">
              <span className="text-white text-xs">✕</span>
            </div>
          )}
          <h3 className="text-lg font-semibold text-on-surface">
            {statusMessages[record.status] || 'Processing...'}
          </h3>
        </div>

        {record.status !== 'failed' && record.status !== 'ready_for_analysis' && (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono text-on-surface-variant mb-2">
                <span>{currentLabel}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {STAGE_ORDER.map((stage, idx) => {
                const isCompleted = idx < stageIdx;
                const isCurrent = idx === stageIdx;
                const isPending = idx > stageIdx;
                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-2 text-xs font-mono py-1 transition-colors duration-300 ${
                      isCompleted
                        ? 'text-green-400'
                        : isCurrent
                          ? 'text-primary-container'
                          : 'text-on-surface-variant/50'
                    }`}
                  >
                    <span className="w-3 text-center">
                      {isCompleted && <span>✓</span>}
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse inline-block" />
                      )}
                      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-surface-bright/30 inline-block" />}
                    </span>
                    <span>{STAGE_LABELS[stage]}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {record.status === 'ready_for_analysis' && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Repository indexed successfully.
            </p>
            {record.fingerprint && (
              <div className="space-y-2 text-xs font-mono">
                {record.fingerprint.primaryLanguage && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Language</span>
                    <span className="text-on-surface">{record.fingerprint.primaryLanguage}</span>
                  </div>
                )}
                {record.fingerprint.framework && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Framework</span>
                    <span className="text-on-surface">{record.fingerprint.framework}</span>
                  </div>
                )}
                {record.fingerprint.packageManager && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Package Manager</span>
                    <span className="text-on-surface">{record.fingerprint.packageManager}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total Files</span>
                  <span className="text-on-surface">{record.total_files.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active Files</span>
                  <span className="text-on-surface">{record.filtered_files.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {record.status === 'failed' && record.error_message && (
          <div className="mt-3 p-3 rounded-lg bg-error-container/10 border border-error-default/30">
            <p className="text-xs text-error-default font-mono">{record.error_message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvestigationPage() {
  const { id: analysisId } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const storedContext = useMemo<AnalysisContext | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('analysis-selection');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
      storedContext
    );
  }, [record, analysisId, storedContext]);

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`/api/analyses/${analysisId}`);
      if (response.status === 404) {
        setError('Analysis not found');
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      setRecord(data.analysis);
      setLoading(false);

      if (
        prevStatusRef.current &&
        prevStatusRef.current !== data.analysis.status
      ) {
        if (data.analysis.status === 'ready_for_analysis') {
          toast.success('Repository index ready! Investigation workspace loaded.');
        } else if (data.analysis.status === 'failed') {
          toast.error(data.analysis.error_message || 'Analysis failed');
        }
      }
      prevStatusRef.current = data.analysis.status;
    } catch {
      setError('Failed to load analysis');
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  useEffect(() => {
    if (!record) return;

    const isRunning =
      record.status === 'queued' ||
      record.status === 'initializing' ||
      record.status === 'indexing';

    if (isRunning) {
      pollRef.current = setInterval(() => {
        fetchAnalysis();
      }, 2000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [record?.status, fetchAnalysis]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const isRunning =
    record?.status === 'queued' ||
    record?.status === 'initializing' ||
    record?.status === 'indexing';

  const isComplete = record?.status === 'ready_for_analysis';
  const isFailed = record?.status === 'failed';

  return (
    <AppShell>
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
              <Button
                variant="outline"
                size="sm"
                className="border-outline-variant/50 text-on-surface-variant"
                onClick={() => router.push('/analysis/new')}
              >
                Start New Analysis
              </Button>
            </div>
          )}

          {!loading && !error && isRunning && record && (
            <ProgressOverlay record={record} />
          )}

          {!loading && !error && isFailed && record && (
            <ProgressOverlay record={record} />
          )}

          {!loading && !error && isComplete && record && (
            <>
              <AnalysisHeader analysis={analysis} />

              <div className="mb-6 p-4 rounded-lg glass border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-on-surface">
                    Repository Index Ready
                  </span>
                </div>
                {record.fingerprint && (
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant mt-2">
                    {record.fingerprint.primaryLanguage && (
                      <span>{record.fingerprint.primaryLanguage}</span>
                    )}
                    {record.fingerprint.framework && (
                      <span>{record.fingerprint.framework}</span>
                    )}
                    {record.fingerprint.packageManager && (
                      <span>{record.fingerprint.packageManager}</span>
                    )}
                    <span>{record.filtered_files.toLocaleString()} files indexed</span>
                    <span>{record.total_files.toLocaleString()} total files</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['overview', 'files', 'root-cause', 'evidence', 'solution', 'patch'] as ActiveTab[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className={
                      activeTab === tab
                        ? 'bg-primary-container text-on-primary-container font-medium'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }
                  >
                    {tab === 'root-cause' ? 'Root Cause' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="max-w-3xl">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {analysis.relevantFiles.length > 0 ? (
                      <RelevantFilesPanel files={analysis.relevantFiles} />
                    ) : (
                      <div className="p-8 rounded-lg glass border border-outline-variant/50 text-center">
                        <p className="text-sm text-on-surface-variant">
                          Repository indexed. AI analysis will identify relevant files in the next phase.
                        </p>
                      </div>
                    )}
                    {analysis.rootCause && <RootCausePanel rootCause={analysis.rootCause} />}
                  </div>
                )}
                {activeTab === 'files' && (
                  analysis.relevantFiles.length > 0 ? (
                    <RelevantFilesPanel files={analysis.relevantFiles} />
                  ) : (
                    <div className="p-8 rounded-lg glass border border-outline-variant/50 text-center">
                      <p className="text-sm text-on-surface-variant">
                        {record.filtered_files.toLocaleString()} files indexed and ready for AI analysis.
                      </p>
                    </div>
                  )
                )}
                {activeTab === 'root-cause' && analysis.rootCause && (
                  <RootCausePanel rootCause={analysis.rootCause} />
                )}
                {activeTab === 'evidence' && analysis.evidence && (
                  <EvidencePanel evidence={analysis.evidence} />
                )}
                {activeTab === 'solution' && analysis.solution && (
                  <SolutionPanel solution={analysis.solution} />
                )}
                {activeTab === 'patch' && analysis.patch && (
                  <PatchViewer patch={analysis.patch} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="w-72 border-l border-outline-variant/50 glass-sidebar p-4 hidden lg:block">
          <h3 className="text-sm font-semibold text-on-surface mb-4">
            Analysis Details
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Repository
              </p>
              <p className="text-sm font-mono text-on-surface">
                {analysis.repository.fullName || 'Loading...'}
              </p>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Issue
              </p>
              <p className="text-sm font-mono text-on-surface">
                #{analysis.issue.number}
              </p>
            </div>

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isComplete
                      ? 'bg-green-500'
                      : isFailed
                        ? 'bg-error-default'
                        : isRunning
                          ? 'bg-primary-container animate-pulse'
                          : 'bg-surface-bright'
                  }`}
                />
                <p className="text-sm text-on-surface capitalize">
                  {record?.status?.replace(/_/g, ' ') || 'Loading...'}
                </p>
              </div>
            </div>

            {record?.current_stage && (
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Current Stage
                </p>
                <p className="text-sm font-mono text-on-surface">
                  {STAGE_LABELS[record.current_stage] || record.current_stage}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Started
              </p>
              <p className="text-sm text-on-surface">
                {new Date(analysis.startedAt).toLocaleString()}
              </p>
            </div>

            {analysis.completedAt && (
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Completed
                </p>
                <p className="text-sm text-on-surface">
                  {new Date(analysis.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            {record?.total_files ? (
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Files
                </p>
                <p className="text-sm font-mono text-on-surface">
                  {record.filtered_files} / {record.total_files.toLocaleString()}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
