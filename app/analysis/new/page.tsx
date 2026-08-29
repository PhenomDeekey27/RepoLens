'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [issuesError, setIssuesError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch('/api/github/repos');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch {
        setReposError("We couldn't load your repositories. Please try again later.");
      } finally {
        setReposLoading(false);
      }
    }
    fetchRepos();
  }, []);

  useEffect(() => {
    if (!selectedRepository) return;

    let cancelled = false;

    async function fetchRepoIssues() {
      setIssuesLoading(true);
      setIssuesError(null);
      try {
        const [owner, repo] = selectedRepository!.fullName.split('/');
        const response = await fetch(
          `/api/github/issues?owner=${owner}&repo=${repo}&state=open`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }
        const data = await response.json();
        if (!cancelled) {
          setIssues(data.issues || []);
        }
      } catch {
        if (!cancelled) {
          setIssuesError("We couldn't load issues for this repository.");
        }
      } finally {
        if (!cancelled) {
          setIssuesLoading(false);
        }
      }
    }
    fetchRepoIssues();

    return () => {
      cancelled = true;
    };
  }, [selectedRepository]);

  const handleRepositorySelect = useCallback((repo: Repository) => {
    setSelectedRepository(repo);
    setSelectedIssue(null);
    setIssues([]);
  }, []);

  const handleStartAnalysis = () => {
    if (selectedRepository && selectedIssue) {
      const analysisId = `analysis-${Date.now()}`;
      localStorage.setItem(
        'analysis-selection',
        JSON.stringify({
          repository: selectedRepository,
          issue: selectedIssue,
        })
      );
      router.push(`/analysis/${analysisId}`);
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
              onSelect={handleRepositorySelect}
              repositories={repositories}
              loading={reposLoading}
              error={reposError}
            />
          </div>

          <div>
            {selectedRepository ? (
              <IssueSelector
                selectedIssue={selectedIssue}
                onSelect={setSelectedIssue}
                issues={issues}
                loading={issuesLoading}
                error={issuesError}
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
