import { githubFetch } from './client';

interface GitHubRef {
  ref: string;
  node_id: string;
  url: string;
  object: {
    type: string;
    sha: string;
    url: string;
  };
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  content: string;
  encoding: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

interface GitHubCommit {
  sha: string;
  node_id: string;
  url: string;
  message: string;
  html_url: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  tree: {
    sha: string;
    url: string;
  };
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
  }>;
}

export async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string
): Promise<{ name: string; commitSha: string }> {
  const repoData = await githubFetch<{ default_branch: string }>(
    `/repos/${owner}/${repo}`,
    { token }
  );

  const branchData = await githubFetch<GitHubBranch>(
    `/repos/${owner}/${repo}/branches/${repoData.default_branch}`,
    { token }
  );

  return {
    name: repoData.default_branch,
    commitSha: branchData.commit.sha,
  };
}

export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  branchName: string,
  fromSha: string
): Promise<GitHubRef> {
  return githubFetch<GitHubRef>(`/repos/${owner}/${repo}/git/refs`, {
    token,
    method: 'POST',
    body: {
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    },
  });
}

export async function getBranchExists(
  token: string,
  owner: string,
  repo: string,
  branchName: string
): Promise<boolean> {
  try {
    await githubFetch<GitHubBranch>(
      `/repos/${owner}/${repo}/branches/${branchName}`,
      { token }
    );
    return true;
  } catch {
    return false;
  }
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const data = await githubFetch<GitHubFileContent>(
      `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      { token }
    );

    const content = atob(data.content.replace(/\n/g, ''));
    return { content, sha: data.sha };
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
): Promise<GitHubCommit> {
  const body: Record<string, unknown> = {
    message,
    content: btoa(content),
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  return githubFetch<GitHubCommit>(
    `/repos/${owner}/${repo}/contents/${path}`,
    {
      token,
      method: 'PUT',
      body,
    }
  );
}

export async function deleteFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  message: string,
  branch: string,
  sha: string
): Promise<GitHubCommit> {
  const body = {
    message,
    sha,
    branch,
  };

  return githubFetch<GitHubCommit>(
    `/repos/${owner}/${repo}/contents/${path}`,
    {
      token,
      method: 'DELETE',
      body,
    }
  );
}

export async function createCommit(
  token: string,
  owner: string,
  repo: string,
  message: string,
  tree: string,
  parents: string[]
): Promise<GitHubCommit> {
  return githubFetch<GitHubCommit>(`/repos/${owner}/${repo}/git/commits`, {
    token,
    method: 'POST',
    body: {
      message,
      tree,
      parents,
    },
  });
}

export async function createTree(
  token: string,
  owner: string,
  repo: string,
  baseTree: string,
  files: Array<{
    path: string;
    content: string;
    mode?: string;
  }>
): Promise<GitHubTreeResponse> {
  const tree = files.map((f) => ({
    path: f.path,
    mode: (f.mode || '100644') as string,
    type: 'blob' as const,
    content: f.content,
  }));

  return githubFetch<GitHubTreeResponse>(`/repos/${owner}/${repo}/git/trees`, {
    token,
    method: 'POST',
    body: {
      base_tree: baseTree,
      tree,
    },
  });
}

export async function updateRef(
  token: string,
  owner: string,
  repo: string,
  ref: string,
  sha: string,
  force?: boolean
): Promise<GitHubRef> {
  return githubFetch<GitHubRef>(`/repos/${owner}/${repo}/git/refs/${ref}`, {
    token,
    method: 'PATCH',
    body: {
      sha,
      force: force || false,
    },
  });
}

interface GitHubPullRequest {
  number: number;
  html_url: string;
  title: string;
  body: string;
  state: string;
  created_at: string;
}

export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string
): Promise<GitHubPullRequest> {
  return githubFetch<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, {
    token,
    method: 'POST',
    body: {
      title,
      body,
      head,
      base,
    },
  });
}
