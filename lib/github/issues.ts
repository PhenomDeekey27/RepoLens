import { extractNextPageNumber } from './client';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: Array<{ name: string; color: string }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  user: { login: string; avatar_url: string };
  pull_request?: unknown;
}

export interface FetchIssuesResult {
  issues: GitHubIssue[];
  nextPage: number | null;
}

export async function fetchIssues(
  token: string,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open',
  page: number = 1,
  perPage: number = 30
): Promise<FetchIssuesResult> {
  const endpoint = `/repos/${owner}/${repo}/issues`;
  const params: Record<string, string> = {
    state,
    page: String(page),
    per_page: String(perPage),
    sort: 'updated',
    direction: 'desc',
  };

  const response = await fetch(
    new URL(`https://api.github.com${endpoint}?${new URLSearchParams(params)}`).toString(),
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  const linkHeader = response.headers.get('link');
  const nextPage = extractNextPageNumber(linkHeader);
  const issues = (await response.json()) as GitHubIssue[];

  return { issues, nextPage };
}

export function isPullRequest(issue: GitHubIssue): boolean {
  return !!issue.pull_request;
}
