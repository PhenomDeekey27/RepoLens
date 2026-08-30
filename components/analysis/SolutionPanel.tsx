import { Solution } from '@/types';
import { Badge } from '@/components/ui/badge';

interface SolutionPanelProps {
  solution: Solution;
}

export function SolutionPanel({ solution }: SolutionPanelProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-on-surface">
          Proposed Solution
        </h2>
        <Badge variant="outline" className="text-xs font-mono">
          {Math.round(solution.confidence * 100)}% confidence
        </Badge>
      </div>

      {solution.summary && (
        <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
          <p className="text-sm text-on-surface font-medium">
            {solution.summary}
          </p>
        </div>
      )}

      <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
        <p className="text-sm text-on-surface leading-relaxed mb-3">
          {solution.description}
        </p>
      </div>

      {solution.steps && solution.steps.length > 0 && (
        <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Steps
          </h3>
          <div className="space-y-2">
            {solution.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-xs font-mono text-primary-container mt-0.5">
                  {index + 1}.
                </span>
                <p className="text-sm text-on-surface">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {solution.affectedFiles && solution.affectedFiles.length > 0 && (
        <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Affected Files
          </h3>
          <div className="space-y-2">
            {solution.affectedFiles.map((file, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-sm font-mono text-primary-container">
                  {file.path}
                </span>
                <span className="text-sm text-on-surface-variant">
                  {file.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {solution.risks && solution.risks.length > 0 && (
        <div className="p-4 rounded-lg glass border border-outline-variant/50">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Risks
          </h3>
          <div className="space-y-1">
            {solution.risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-xs text-yellow-500 mt-0.5">⚠</span>
                <p className="text-sm text-on-surface-variant">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
