interface Stat {
  label: string;
  value: string | number;
}

const defaultStats: Stat[] = [
  { label: 'Repositories', value: 12 },
  { label: 'Issues Analyzed', value: 47 },
  { label: 'Patches Generated', value: 38 },
];

interface StatsGridProps {
  stats?: Stat[];
}

export function StatsGrid({ stats = defaultStats }: StatsGridProps) {
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
