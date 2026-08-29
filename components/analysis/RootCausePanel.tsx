import { RootCause } from '@/types';
import { Badge } from '@/components/ui/badge';

interface RootCausePanelProps {
  rootCause: RootCause;
}

export function RootCausePanel({ rootCause }: RootCausePanelProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-on-surface">
          Root Cause Identified
        </h2>
        <Badge variant="outline" className="text-xs font-mono">
          {rootCause.confidence}% confidence
        </Badge>
      </div>

      <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
        <p className="text-sm text-on-surface leading-relaxed">
          {rootCause.description}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-on-surface mb-2">
          Affected Files
        </h3>
        <div className="space-y-1">
          {rootCause.affectedFiles.map((file) => (
            <div
              key={file}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container/50"
            >
              <span className="text-sm font-mono text-primary-container">
                {file}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
