import { Repository } from '@/types';
import { mockRepositories } from '@/lib/mock/repositories';
import { cn } from '@/lib/utils';

interface RepositorySelectorProps {
  selectedRepository: Repository | null;
  onSelect: (repository: Repository) => void;
}

export function RepositorySelector({
  selectedRepository,
  onSelect,
}: RepositorySelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Select Repository
      </h2>

      <div className="space-y-2">
        {mockRepositories.map((repo) => (
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
                {repo.language}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant truncate">
              {repo.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
              <span>★ {repo.stars}</span>
              <span>⑂ {repo.forks}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
