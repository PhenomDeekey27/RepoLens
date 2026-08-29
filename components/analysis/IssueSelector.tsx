import { Issue, Repository } from '@/types';
import { getIssuesByRepository } from '@/lib/mock/issues';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IssueSelectorProps {
  repository: Repository;
  selectedIssue: Issue | null;
  onSelect: (issue: Issue) => void;
}

export function IssueSelector({
  repository,
  selectedIssue,
  onSelect,
}: IssueSelectorProps) {
  const issues = getIssuesByRepository(repository.id);

  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Select Issue
      </h2>

      <div className="space-y-2">
        {issues.map((issue) => (
          <button
            key={issue.id}
            onClick={() => onSelect(issue)}
            className={cn(
              'w-full p-4 rounded border text-left transition-colors',
              selectedIssue?.id === issue.id
                ? 'border-primary-container bg-surface-container-high'
                : 'border-outline-variant bg-surface-container hover:bg-surface-container-high'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono text-on-surface">
                #{issue.number}
              </span>
              <div className="flex gap-1">
                {issue.labels.slice(0, 2).map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant truncate">
              {issue.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
