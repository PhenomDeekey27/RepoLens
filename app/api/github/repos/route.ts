import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchAllRepositories } from '@/lib/github/repositories';
import { Repository } from '@/types';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json(
      { error: 'GitHub token not available. Please sign in again.' },
      { status: 401 }
    );
  }

  try {
    const githubRepos = await fetchAllRepositories(session.provider_token);

    const repositories: Repository[] = githubRepos.map((repo) => ({
      id: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      language: repo.language || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      lastUpdated: repo.pushed_at || repo.updated_at,
      private: repo.private,
      owner: repo.owner.login,
      ownerAvatar: repo.owner.avatar_url,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
    }));

    return NextResponse.json({ repositories });
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
