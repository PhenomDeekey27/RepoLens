import { githubFetch } from './client';

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>('/user', { token });
}
