interface Stat {
  label: string;
  value: string | number;
}

interface StatsGridProps {
  stats?: Stat[];
}

export function StatsGrid({ stats = [] }: StatsGridProps) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded border border-outline-variant bg-surface-container">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Repositories
          </p>
          <p className="text-2xl font-semibold text-on-surface">—</p>
        </div>
        <div className="p-4 rounded border border-outline-variant bg-surface-container">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Issues Analyzed
          </p>
          <p className="text-2xl font-semibold text-on-surface">0</p>
        </div>
        <div className="p-4 rounded border border-outline-variant bg-surface-container">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Patches Generated
          </p>
          <p className="text-2xl font-semibold text-on-surface">0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded border border-outline-variant bg-surface-container"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-semibold text-on-surface">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
