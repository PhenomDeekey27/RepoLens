'use client';

import { Repository } from '@/types';
import { cn } from '@/lib/utils';

interface RepositorySelectorProps {
  selectedRepository: Repository | null;
  onSelect: (repository: Repository) => void;
  repositories: Repository[];
  loading?: boolean;
  error?: string | null;
}

export function RepositorySelector({
  selectedRepository,
  onSelect,
  repositories,
  loading = false,
  error = null,
}: RepositorySelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Select Repository
      </h2>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full p-4 rounded border border-outline-variant bg-surface-container animate-pulse"
            >
              <div className="h-4 bg-surface-container-high rounded w-1/3 mb-2" />
              <div className="h-3 bg-surface-container-high rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded border border-error-default/30 bg-error-container/10">
          <p className="text-sm text-error-default">{error}</p>
        </div>
      )}

      {!loading && !error && repositories.length === 0 && (
        <div className="p-8 rounded border border-outline-variant bg-surface-container text-center">
          <p className="text-sm text-on-surface-variant">
            No repositories found. Make sure your GitHub account has access to repositories.
          </p>
        </div>
      )}

      {!loading && !error && repositories.length > 0 && (
        <div className="space-y-2">
          {repositories.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onSelect(repo)}
              className={cn(
                'w-full p-4 rounded border text-left transition-colors',
                selectedRepository?.id === repo.id
                  ? 'border-primary-container bg-surface-container-high'
                  : 'border-outline-variant bg-surface-container hover:bg-surface-container-high'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono text-primary-container">
                  {repo.fullName}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {repo.language || 'N/A'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant truncate">
                {repo.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
                {repo.stars > 0 && <span>★ {repo.stars}</span>}
                {repo.forks > 0 && <span>⑂ {repo.forks}</span>}
                {repo.private && (
                  <span className="text-tertiary">Private</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
