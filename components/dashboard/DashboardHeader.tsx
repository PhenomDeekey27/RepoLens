interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = 'developer' }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-on-surface mb-2">
        Good evening, {userName}.
      </h1>
      <p className="text-sm text-on-surface-variant">
        System online. All systems nominal.
      </p>
    </div>
  );
}
