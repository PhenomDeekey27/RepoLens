'use client';

import { RelevantFilesPanel } from '@/components/analysis/RelevantFilesPanel';
import { RootCausePanel } from '@/components/analysis/RootCausePanel';
import { EvidencePanel } from '@/components/analysis/EvidencePanel';
import { SolutionPanel } from '@/components/analysis/SolutionPanel';
import { PatchViewer } from '@/components/analysis/PatchViewer';
import { RepositoryFileTree } from '@/components/analysis/RepositoryFileTree';
import { AnalysisOverview } from '@/components/analysis/AnalysisOverview';
import {
  Analysis,
  AnalysisRecord,
  RepositoryFileRecord,
  RelevantFile,
  IssueContext,
  IssueComment,
} from '@/types';

type ActiveTab = 'overview' | 'files' | 'root-cause' | 'evidence' | 'solution' | 'patch';

interface AnalysisTabContentProps {
  activeTab: ActiveTab;
  analysis: Analysis;
  record: AnalysisRecord;
  repositoryFiles: RepositoryFileRecord[];
  relevantFiles: RelevantFile[];
  issueContext: IssueContext | null;
  comments: IssueComment[];
}

export function AnalysisTabContent({
  activeTab,
  analysis,
  record,
  repositoryFiles,
  relevantFiles,
  issueContext,
  comments,
}: AnalysisTabContentProps) {
  return (
    <div className="max-w-3xl">
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AnalysisOverview
            fingerprint={record.fingerprint}
            issue={issueContext || {
              number: record.issue_number,
              title: record.issue_title,
              body: '',
              state: 'open',
              labels: [],
              author: '',
              createdAt: record.created_at,
              updatedAt: record.updated_at,
              commentsCount: 0,
              htmlUrl: '',
            }}
            comments={comments}
            totalFiles={record.total_files}
            filteredFiles={record.filtered_files}
            repositoryFullName={record.repository_full_name}
          />
          {relevantFiles.length > 0 && (
            <RelevantFilesPanel files={relevantFiles} />
          )}
          {analysis.rootCause && <RootCausePanel rootCause={analysis.rootCause} />}
        </div>
      )}

      {activeTab === 'files' && (
        <div className="space-y-4">
          <RepositoryFileTree
            files={repositoryFiles}
            relevantFiles={relevantFiles}
          />
          {relevantFiles.length > 0 && (
            <RelevantFilesPanel files={relevantFiles} />
          )}
        </div>
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
  );
}
