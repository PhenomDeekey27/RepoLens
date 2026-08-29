'use client';

import { AnalysisRecord } from '@/types';

interface ProgressOverlayProps {
  record: AnalysisRecord;
}

const STAGE_LABELS: Record<string, string> = {
  issue_context: 'Issue Context',
  issue_comments: 'Issue Comments',
  repository_tree: 'Repository Tree',
  file_filtering: 'File Filtering',
  repository_fingerprint: 'Repository Fingerprint',
  ready: 'Ready',
  relevant_files_discovery: 'AI Discovery',
  relevant_files_fetch: 'Fetching Files',
  relevant_files_complete: 'Files Ready',
};

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

export function ProgressOverlay({ record }: ProgressOverlayProps) {
  const currentLabel = STAGE_LABELS[record.current_stage] || record.current_stage;
  const stageIdx = STAGE_ORDER.indexOf(record.current_stage);
  const progress = Math.round(((stageIdx + 1) / STAGE_ORDER.length) * 100);

  const statusMessages: Record<string, string> = {
    queued: 'Queued... waiting to start',
    initializing: 'Initializing investigation...',
    indexing: 'Indexing repository...',
    ready_for_analysis: 'Repository index ready!',
    relevant_file_discovery: 'Discovering relevant files...',
    relevant_files_ready: 'Relevant files ready!',
    failed: 'Analysis failed',
    completed: 'Analysis complete',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md glass rounded-xl border border-outline-variant/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          {record.status !== 'failed' && record.status !== 'ready_for_analysis' && record.status !== 'relevant_files_ready' && (
            <div className="w-5 h-5 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
          )}
          {(record.status === 'ready_for_analysis' || record.status === 'relevant_files_ready') && (
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

        {record.status !== 'failed' && record.status !== 'ready_for_analysis' && record.status !== 'relevant_files_ready' && (
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
                      isCompleted ? 'text-green-400' : isCurrent ? 'text-primary-container' : 'text-on-surface-variant/50'
                    }`}
                  >
                    <span className="w-3 text-center">
                      {isCompleted && <span>✓</span>}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse inline-block" />}
                      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-surface-bright/30 inline-block" />}
                    </span>
                    <span>{STAGE_LABELS[stage]}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {(record.status === 'ready_for_analysis' || record.status === 'relevant_files_ready') && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              {record.status === 'relevant_files_ready' ? 'Relevant files discovered successfully.' : 'Repository indexed successfully.'}
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
