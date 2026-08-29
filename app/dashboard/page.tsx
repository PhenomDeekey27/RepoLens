import { AppShell } from '@/components/layout/AppShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <DashboardHeader />
        <StatsGrid />
        <RecentAnalyses />

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4">
            <Link href="/analysis/new">
              <Button className="bg-primary-container text-on-primary-container hover:bg-primary-container/90">
                Analyze an Issue
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            >
              Browse Repositories
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
