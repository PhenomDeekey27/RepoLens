import { AppShell } from '@/components/layout/AppShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const githubUser = user?.user_metadata
    ? {
        login: user.user_metadata.user_name || user.user_metadata.login || 'user',
        name: user.user_metadata.full_name || user.user_metadata.name || null,
        avatarUrl: user.user_metadata.avatar_url || '',
      }
    : null;

  return (
    <AppShell user={githubUser}>
      <div className="p-6 max-w-4xl mx-auto">
        <DashboardHeader userName={githubUser?.login || 'developer'} />
        <StatsGrid stats={[]} />
        <RecentAnalyses analyses={[]} />

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
          </div>
        </div>
      </div>
    </AppShell>
  );
}
