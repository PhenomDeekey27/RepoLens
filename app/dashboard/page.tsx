import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses';
import { WelcomeToast } from '@/components/dashboard/WelcomeToast';
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

  let repoCount: string | number = '—';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (response.ok) {
        const githubUserData = await response.json();
        repoCount = githubUserData.public_repos ?? '—';
      }
    }
  } catch {
    // Keep default
  }

  return (
    <AppShell user={githubUser}>
      <Suspense>
        <WelcomeToast />
      </Suspense>
      <div className="p-6 max-w-4xl mx-auto">
        <DashboardHeader userName={githubUser?.login || 'developer'} />
        <StatsGrid stats={[
          { label: 'Repositories', value: repoCount },
          { label: 'Issues Analyzed', value: 0 },
          { label: 'Patches Generated', value: 0 },
        ]} />
        <RecentAnalyses analyses={[]} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-on-surface mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4">
            <Link href="/analysis/new">
              <Button className="gradient-primary text-white hover:gradient-primary-hover font-medium">
                Analyze an Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
