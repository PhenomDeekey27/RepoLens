import { Analysis } from '@/types';

interface RecentAnalysesProps {
  analyses?: Analysis[];
}

export function RecentAnalyses({ analyses = [] }: RecentAnalysesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Recent Analyses
      </h2>

      {analyses.length === 0 ? (
        <div className="p-8 rounded-lg glass border border-outline-variant/50 text-center">
          <p className="text-sm text-on-surface-variant">
            No analyses yet. Start by analyzing a GitHub issue.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="block p-4 rounded-lg glass border border-outline-variant/50 hover:border-primary-container/30 transition-all cursor-pointer"
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
