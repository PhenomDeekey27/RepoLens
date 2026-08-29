import { Repository } from '@/types';

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'core-engine',
    fullName: 'acme/core-engine',
    description: 'High-performance distributed processing engine for real-time data pipelines',
    language: 'TypeScript',
    stars: 2847,
    forks: 342,
    lastUpdated: '2026-08-27T14:30:00Z',
    private: false,
  },
  {
    id: '2',
    name: 'auth-service',
    fullName: 'acme/auth-service',
    description: 'Enterprise authentication and authorization microservice',
    language: 'Go',
    stars: 1523,
    forks: 189,
    lastUpdated: '2026-08-26T09:15:00Z',
    private: false,
  },
  {
    id: '3',
    name: 'web-dashboard',
    fullName: 'acme/web-dashboard',
    description: 'Analytics dashboard for monitoring system performance',
    language: 'React',
    stars: 892,
    forks: 124,
    lastUpdated: '2026-08-25T16:45:00Z',
    private: false,
  },
  {
    id: '4',
    name: 'api-gateway',
    fullName: 'acme/api-gateway',
    description: 'Central API gateway with rate limiting and request routing',
    language: 'Rust',
    stars: 3241,
    forks: 456,
    lastUpdated: '2026-08-24T11:20:00Z',
    private: false,
  },
  {
    id: '5',
    name: 'data-pipeline',
    fullName: 'acme/data-pipeline',
    description: 'ETL pipeline for processing and transforming large datasets',
    language: 'Python',
    stars: 1876,
    forks: 234,
    lastUpdated: '2026-08-23T08:00:00Z',
    private: true,
  },
];

export function getRepositoryById(id: string): Repository | undefined {
  return mockRepositories.find(repo => repo.id === id);
}

export function getRepositoryByFullName(fullName: string): Repository | undefined {
  return mockRepositories.find(repo => repo.fullName === fullName);
}
