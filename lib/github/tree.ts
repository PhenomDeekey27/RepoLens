import { githubFetch } from './client';

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  size?: number;
  sha: string;
  url?: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export async function fetchRepositoryTree(
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<{ tree: GitHubTreeItem[]; truncated: boolean }> {
  try {
    const response = await githubFetch<GitHubTreeResponse>(
      `/repos/${owner}/${repo}/git/trees/${branch}`,
      {
        token,
        params: { recursive: '1' },
      }
    );

    return {
      tree: response.tree,
      truncated: response.truncated,
    };
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('404')) {
      try {
        const repoInfo = await githubFetch<{ default_branch: string }>(
          `/repos/${owner}/${repo}`,
          { token }
        );
        if (repoInfo.default_branch !== branch) {
          const retryResponse = await githubFetch<GitHubTreeResponse>(
            `/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}`,
            {
              token,
              params: { recursive: '1' },
            }
          );
          return {
            tree: retryResponse.tree,
            truncated: retryResponse.truncated,
          };
        }
      } catch {
        // Fall through to original error
      }
    }
    throw error;
  }
}

export async function fetchSubTree(
  token: string,
  owner: string,
  repo: string,
  treeSha: string
): Promise<GitHubTreeItem[]> {
  const response = await githubFetch<GitHubTreeResponse>(
    `/repos/${owner}/${repo}/git/trees/${treeSha}`,
    { token }
  );
  return response.tree;
}
