const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRequestOptions {
  token: string;
  method?: string;
  params?: Record<string, string>;
}

export async function githubFetch<T>(
  endpoint: string,
  options: GitHubRequestOptions
): Promise<T> {
  const { token, method = 'GET', params } = options;

  const url = new URL(`${GITHUB_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub API error ${response.status}: ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

export function extractNextPageNumber(linkHeader: string | null): number | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="next"/);
  return match ? parseInt(match[1], 10) : null;
}
