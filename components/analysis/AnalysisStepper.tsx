import { AnalysisStageInfo } from '@/types';
import { cn } from '@/lib/utils';

interface AnalysisStepperProps {
  stages: AnalysisStageInfo[];
}

export function AnalysisStepper({ stages }: AnalysisStepperProps) {
  return (
    <div className="space-y-2">
      {stages.map((stage) => (
        <div
          key={stage.stage}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded text-sm transition-all',
            stage.status === 'completed' && 'text-on-surface',
            stage.status === 'running' && 'text-primary-container bg-primary-container/10 border-l-2 border-primary-container',
            stage.status === 'pending' && 'text-on-surface-variant',
            stage.status === 'failed' && 'text-error-default'
          )}
        >
          <span className="w-4 text-center">
            {stage.status === 'completed' && <span className="text-green-500">✓</span>}
            {stage.status === 'running' && (
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse inline-block" />
            )}
            {stage.status === 'pending' && (
              <span className="w-2 h-2 rounded-full bg-surface-bright inline-block" />
            )}
            {stage.status === 'failed' && <span className="text-error-default">✕</span>}
          </span>
          <span className="font-mono text-xs">{stage.label}</span>
        </div>
      ))}
    </div>
  );
}
