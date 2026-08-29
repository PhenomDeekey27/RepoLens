import { Issue } from '@/types';

export const mockIssues: Issue[] = [
  {
    id: '1',
    number: 402,
    title: 'Memory leak in thread pool executor',
    body: 'When processing large batches of requests, the thread pool executor fails to release memory properly. This leads to increasing memory consumption over time, eventually causing OOM errors in production.',
    state: 'open',
    labels: ['bug', 'critical', 'performance'],
    assignees: ['developer'],
    createdAt: '2026-08-20T10:30:00Z',
    updatedAt: '2026-08-27T14:30:00Z',
    closedAt: null,
    comments: 5,
    htmlUrl: 'https://github.com/acme/core-engine/issues/402',
    userLogin: 'developer',
    repositoryId: '1',
  },
  {
    id: '2',
    number: 128,
    title: 'JWT validation bypass vulnerability',
    body: 'A critical security vulnerability has been discovered in the JWT validation pipeline. Under specific conditions, expired tokens can bypass validation checks.',
    state: 'open',
    labels: ['bug', 'critical', 'security'],
    assignees: ['security-team'],
    createdAt: '2026-08-19T08:15:00Z',
    updatedAt: '2026-08-26T09:15:00Z',
    closedAt: null,
    comments: 12,
    htmlUrl: 'https://github.com/acme/auth-service/issues/128',
    userLogin: 'security-team',
    repositoryId: '2',
  },
  {
    id: '3',
    number: 89,
    title: 'Dashboard charts not rendering on Safari',
    body: 'The performance charts on the dashboard are not rendering correctly in Safari browser. Charts appear blank or with incorrect data visualization.',
    state: 'open',
    labels: ['bug', 'ui', 'browser-compatibility'],
    assignees: ['frontend-team'],
    createdAt: '2026-08-18T14:45:00Z',
    updatedAt: '2026-08-25T16:45:00Z',
    closedAt: null,
    comments: 3,
    htmlUrl: 'https://github.com/acme/web-dashboard/issues/89',
    userLogin: 'frontend-team',
    repositoryId: '3',
  },
  {
    id: '4',
    number: 256,
    title: 'Rate limiter not respecting X-Forwarded-For headers',
    body: 'The rate limiter is counting requests based on the direct connection IP instead of the original client IP when behind a proxy. This causes legitimate requests to be rate-limited.',
    state: 'open',
    labels: ['bug', 'enhancement'],
    assignees: ['backend-team'],
    createdAt: '2026-08-17T12:00:00Z',
    updatedAt: '2026-08-24T11:20:00Z',
    closedAt: null,
    comments: 7,
    htmlUrl: 'https://github.com/acme/api-gateway/issues/256',
    userLogin: 'backend-team',
    repositoryId: '4',
  },
  {
    id: '5',
    number: 178,
    title: 'ETL pipeline fails silently on malformed CSV rows',
    body: 'The data pipeline encounters malformed CSV rows and fails silently without logging errors or alerting operators. This leads to data loss without notification.',
    state: 'open',
    labels: ['bug', 'data-integrity'],
    assignees: ['data-team'],
    createdAt: '2026-08-16T09:30:00Z',
    updatedAt: '2026-08-23T08:00:00Z',
    closedAt: null,
    comments: 4,
    htmlUrl: 'https://github.com/acme/data-pipeline/issues/178',
    userLogin: 'data-team',
    repositoryId: '5',
  },
];

export function getIssuesByRepository(repositoryId: string): Issue[] {
  return mockIssues.filter(issue => issue.repositoryId === repositoryId);
}

export function getIssueById(id: string): Issue | undefined {
  return mockIssues.find(issue => issue.id === id);
}

export function getIssueByNumber(repositoryId: string, number: number): Issue | undefined {
  return mockIssues.find(
    issue => issue.repositoryId === repositoryId && issue.number === number
  );
}
