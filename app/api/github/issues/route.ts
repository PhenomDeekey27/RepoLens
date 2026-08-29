import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchIssues, isPullRequest } from '@/lib/github/issues';
import { Issue } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const state = searchParams.get('state') as 'open' | 'closed' | 'all' | null;
  const page = searchParams.get('page');

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'owner and repo query parameters are required' },
      { status: 400 }
    );
  }

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
    const { issues: githubIssues } = await fetchIssues(
      session.provider_token,
      owner,
      repo,
      state || 'open',
      page ? parseInt(page, 10) : 1,
      30
    );

    const issues: Issue[] = githubIssues
      .filter((issue) => !isPullRequest(issue))
      .map((issue) => ({
        id: String(issue.id),
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        labels: issue.labels.map((l) => l.name),
        assignees: issue.assignees.map((a) => a.login),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        comments: issue.comments,
        htmlUrl: issue.html_url,
        userLogin: issue.user.login,
        repositoryId: `${owner}/${repo}`,
      }));

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}
