import { extractNextPageNumber } from './client';

export interface GitHubComment {
  id: number;
  body: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  html_url: string;
}

export async function fetchIssueComments(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  page: number = 1,
  perPage: number = 30
): Promise<{ comments: GitHubComment[]; nextPage: number | null }> {
  const url = new URL(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`
  );
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  const linkHeader = response.headers.get('link');
  const nextPage = extractNextPageNumber(linkHeader);
  const comments = (await response.json()) as GitHubComment[];

  return { comments, nextPage };
}

export async function fetchAllIssueComments(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubComment[]> {
  const allComments: GitHubComment[] = [];
  let page = 1;

  while (page <= 10) {
    const { comments, nextPage } = await fetchIssueComments(
      token, owner, repo, issueNumber, page, 100
    );
    allComments.push(...comments);
    if (!nextPage) break;
    page = nextPage;
  }

  return allComments;
}
