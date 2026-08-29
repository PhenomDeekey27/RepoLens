import { AnalysisStageInfo } from '@/types';
import { cn } from '@/lib/utils';

interface AnalysisStepperProps {
  stages: AnalysisStageInfo[];
}

export function AnalysisStepper({ stages }: AnalysisStepperProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-3 px-3">
        Pipeline
      </p>
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        return (
          <div key={stage.stage} className="relative">
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-300',
                stage.status === 'completed' && 'text-on-surface',
                stage.status === 'running' && 'text-primary-container bg-primary-container/8 border-l-2 border-primary-container',
                stage.status === 'pending' && 'text-on-surface-variant/60',
                stage.status === 'failed' && 'text-error-default'
              )}
            >
              <span className="w-4 flex-shrink-0 text-center">
                {stage.status === 'completed' && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500/20">
                    <span className="text-green-400 text-xs">✓</span>
                  </span>
                )}
                {stage.status === 'running' && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container/40" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container" />
                  </span>
                )}
                {stage.status === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-surface-bright/30 inline-block" />
                )}
                {stage.status === 'failed' && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-error-container/20">
                    <span className="text-error-default text-xs">✕</span>
                  </span>
                )}
              </span>
              <span className={cn(
                'font-mono text-xs truncate',
                stage.status === 'running' && 'font-semibold'
              )}>
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                'absolute left-[21px] top-[30px] w-px h-1',
                stage.status === 'completed' ? 'bg-green-500/30' : 'bg-surface-bright/10'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
