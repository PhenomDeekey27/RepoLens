interface Stat {
  label: string;
  value: string | number;
}

interface StatsGridProps {
  stats?: Stat[];
}

export function StatsGrid({ stats = [] }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-lg glass border border-outline-variant/50 hover:border-primary-container/30 transition-colors"
        >
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-on-surface">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
