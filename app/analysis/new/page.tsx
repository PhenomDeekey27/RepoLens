'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { RepositorySelector } from '@/components/analysis/RepositorySelector';
import { IssueSelector } from '@/components/analysis/IssueSelector';
import { Button } from '@/components/ui/button';
import { Repository, Issue } from '@/types';

export default function NewAnalysisPage() {
  const router = useRouter();
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleStartAnalysis = () => {
    if (selectedRepository && selectedIssue) {
      router.push('/analysis/analysis-1');
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-on-surface mb-6">
          New Analysis
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <RepositorySelector
              selectedRepository={selectedRepository}
              onSelect={setSelectedRepository}
            />
          </div>

          <div>
            {selectedRepository ? (
              <IssueSelector
                repository={selectedRepository}
                selectedIssue={selectedIssue}
                onSelect={setSelectedIssue}
              />
            ) : (
              <div className="flex items-center justify-center h-64 rounded border border-outline-variant bg-surface-container">
                <p className="text-sm text-on-surface-variant">
                  Select a repository first
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedRepository && selectedIssue && (
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-primary-container text-on-primary-container hover:bg-primary-container/90"
              onClick={handleStartAnalysis}
            >
              Start Analysis
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
