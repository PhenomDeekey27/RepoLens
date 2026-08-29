'use client';

import { useState } from 'react';
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

type ActiveTab = 'overview' | 'files' | 'root-cause' | 'evidence' | 'solution' | 'patch';

export default function InvestigationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const analysis = mockAnalysis;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-48px)]">
        {/* Left navigation */}
        <div className="w-48 border-r border-outline-variant bg-surface-container-low p-3 hidden md:block">
          <AnalysisStepper stages={analysis.stages} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <AnalysisHeader analysis={analysis} />

          {/* Tab navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('files')}
              className={activeTab === 'files' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Relevant Files
            </Button>
            <Button
              variant={activeTab === 'root-cause' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('root-cause')}
              className={activeTab === 'root-cause' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Root Cause
            </Button>
            <Button
              variant={activeTab === 'evidence' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('evidence')}
              className={activeTab === 'evidence' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Evidence
            </Button>
            <Button
              variant={activeTab === 'solution' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('solution')}
              className={activeTab === 'solution' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Solution
            </Button>
            <Button
              variant={activeTab === 'patch' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('patch')}
              className={activeTab === 'patch' ? 'bg-surface-container-high' : 'text-on-surface-variant'}
            >
              Patch
            </Button>
          </div>

          {/* Tab content */}
          <div className="max-w-3xl">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <RelevantFilesPanel files={analysis.relevantFiles} />
                {analysis.rootCause && <RootCausePanel rootCause={analysis.rootCause} />}
              </div>
            )}
            {activeTab === 'files' && <RelevantFilesPanel files={analysis.relevantFiles} />}
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
        </div>

        {/* Right context panel */}
        <div className="w-72 border-l border-outline-variant bg-surface-container-low p-4 hidden lg:block">
          <h3 className="text-sm font-semibold text-on-surface mb-4">
            Analysis Details
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Repository
              </p>
              <p className="text-sm font-mono text-on-surface">
                {analysis.repository.fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Issue
              </p>
              <p className="text-sm font-mono text-on-surface">
                #{analysis.issue.number}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Status
              </p>
              <p className="text-sm text-on-surface capitalize">
                {analysis.status}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Started
              </p>
              <p className="text-sm text-on-surface">
                {new Date(analysis.startedAt).toLocaleString()}
              </p>
            </div>

            {analysis.completedAt && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Completed
                </p>
                <p className="text-sm text-on-surface">
                  {new Date(analysis.completedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
