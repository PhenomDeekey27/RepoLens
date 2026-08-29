import { extractNextPageNumber } from './client';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  default_branch: string;
  html_url: string;
}

export interface FetchRepositoriesResult {
  repositories: GitHubRepository[];
  nextPage: number | null;
}

export async function fetchRepositories(
  token: string,
  page: number = 1,
  perPage: number = 30
): Promise<FetchRepositoriesResult> {
  const url = new URL('https://api.github.com/user/repos');
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('sort', 'pushed');
  url.searchParams.set('direction', 'desc');

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
  const repositories = (await response.json()) as GitHubRepository[];

  return { repositories, nextPage };
}

export async function fetchAllRepositories(
  token: string
): Promise<GitHubRepository[]> {
  const allRepos: GitHubRepository[] = [];
  let page = 1;

  while (page <= 10) {
    const { repositories, nextPage } = await fetchRepositories(token, page, 100);
    allRepos.push(...repositories);
    if (!nextPage) break;
    page = nextPage;
  }

  return allRepos;
}
