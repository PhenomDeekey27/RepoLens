import { Solution } from '@/types';

interface SolutionPanelProps {
  solution: Solution;
}

export function SolutionPanel({ solution }: SolutionPanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Proposed Solution
      </h2>

      <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
        <p className="text-sm text-on-surface leading-relaxed mb-3">
          {solution.description}
        </p>

        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Approach
          </h3>
          <div className="p-3 rounded-lg bg-surface-container/50">
            <pre className="text-sm text-on-surface whitespace-pre-wrap font-mono">
              {solution.approach}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
