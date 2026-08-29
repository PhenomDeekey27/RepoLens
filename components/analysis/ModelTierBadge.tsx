'use client';

import { cn } from '@/lib/utils';

interface ModelTierBadgeProps {
  tier: 'fast' | 'balanced' | 'deep';
  status?: 'active' | 'pending' | 'completed' | 'error';
  provider?: string;
  model?: string;
  showDetails?: boolean;
  className?: string;
}

const tierConfig = {
  fast: {
    label: 'Fast',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    glowColor: 'shadow-[0_0_12px_rgba(250,204,21,0.15)]',
    description: 'Classification & ranking',
  },
  balanced: {
    label: 'Balanced',
    icon: '◎',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    glowColor: 'shadow-[0_0_12px_rgba(96,165,250,0.15)]',
    description: 'Analysis & reasoning',
  },
  deep: {
    label: 'Deep',
    icon: '◆',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
    glowColor: 'shadow-[0_0_12px_rgba(192,132,252,0.15)]',
    description: 'Complex generation',
  },
};

const statusConfig = {
  active: {
    label: 'Processing',
    dotColor: 'bg-green-400',
    animate: true,
  },
  pending: {
    label: 'Queued',
    dotColor: 'bg-surface-bright',
    animate: false,
  },
  completed: {
    label: 'Complete',
    dotColor: 'bg-green-400',
    animate: false,
  },
  error: {
    label: 'Failed',
    dotColor: 'bg-error-default',
    animate: false,
  },
};

export function ModelTierBadge({
  tier,
  status = 'pending',
  provider,
  model,
  showDetails = false,
  className,
}: ModelTierBadgeProps) {
  const config = tierConfig[tier];
  const statusInfo = statusConfig[status];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-3 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        status === 'active' && config.glowColor,
        className
      )}
    >
      {status === 'active' && (
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      )}

      <div className="relative flex items-center gap-2 mb-1">
        <span className={cn('text-sm', config.color)}>{config.icon}</span>
        <span className={cn('text-xs font-mono font-bold uppercase tracking-wider', config.color)}>
          {config.label}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              statusInfo.dotColor,
              statusInfo.animate && 'animate-pulse'
            )}
          />
          <span className="text-[10px] font-mono text-on-surface-variant">
            {statusInfo.label}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="relative mt-2 space-y-1">
          <p className="text-[10px] font-mono text-on-surface-variant">
            {config.description}
          </p>
          {provider && (
            <p className="text-[10px] font-mono text-on-surface-variant">
              Provider: <span className="text-on-surface">{provider}</span>
            </p>
          )}
          {model && (
            <p className="text-[10px] font-mono text-on-surface-variant">
              Model: <span className="text-on-surface">{model}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ModelTierPipelineProps {
  activeTier?: 'fast' | 'balanced' | 'deep' | null;
  completedTiers?: ('fast' | 'balanced' | 'deep')[];
  provider?: string;
  models?: Record<string, string>;
  className?: string;
}

export function ModelTierPipeline({
  activeTier,
  completedTiers = [],
  provider,
  models,
  className,
}: ModelTierPipelineProps) {
  const tiers: Array<'fast' | 'balanced' | 'deep'> = ['fast', 'balanced', 'deep'];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
          AI Pipeline
        </span>
        {provider && (
          <span className="text-[10px] font-mono text-on-surface-variant">
            via {provider}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier) => {
          const isActive = activeTier === tier;
          const isCompleted = completedTiers.includes(tier);
          const status = isActive ? 'active' : isCompleted ? 'completed' : 'pending';

          return (
            <ModelTierBadge
              key={tier}
              tier={tier}
              status={status}
              provider={provider}
              model={models?.[tier]}
              showDetails={isActive || isCompleted}
            />
          );
        })}
      </div>
    </div>
  );
}
