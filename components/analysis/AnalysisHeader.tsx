import { Analysis } from '@/types';
import { Badge } from '@/components/ui/badge';

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export function AnalysisHeader({ analysis }: AnalysisHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-mono text-primary-container">
          {analysis.repository.name}
        </span>
        <span className="text-on-surface-variant">/</span>
        <span className="text-sm font-mono text-on-surface">
          Issue #{analysis.issue.number}
        </span>
      </div>

      <h1 className="text-xl font-semibold text-on-surface mb-3">
        {analysis.issue.title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Branch:</span>
          <span className="text-xs font-mono text-on-surface">main</span>
        </div>
        <Badge
          variant={analysis.status === 'completed' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {analysis.status === 'completed' ? 'Completed' : 'Analyzing'}
        </Badge>
      </div>
    </div>
  );
}
