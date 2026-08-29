import Link from 'next/link';
import { Analysis } from '@/types';
import { mockRecentAnalyses } from '@/lib/mock/analyses';
import { Badge } from '@/components/ui/badge';

interface RecentAnalysesProps {
  analyses?: Analysis[];
}

export function RecentAnalyses({ analyses = mockRecentAnalyses }: RecentAnalysesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Recent Analyses
      </h2>

      <div className="space-y-2">
        {analyses.map((analysis) => (
          <Link
            key={analysis.id}
            href={`/analysis/${analysis.id}`}
            className="block p-4 rounded border border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-primary-container">
                    {analysis.repository.name}
                  </span>
                  <span className="text-on-surface-variant">/</span>
                  <span className="text-sm font-mono text-on-surface">
                    Issue #{analysis.issue.number}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate">
                  {analysis.issue.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={analysis.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {analysis.status === 'completed' ? 'Completed' : 'Analyzing'}
                </Badge>
                {analysis.status === 'completed' && (
                  <Badge variant="outline" className="text-xs">
                    High Confidence
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
