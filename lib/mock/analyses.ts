import { Analysis, AnalysisStageInfo } from '@/types';
import { mockRepositories } from './repositories';
import { mockIssues } from './issues';

export const mockAnalysisStages: AnalysisStageInfo[] = [
  { stage: 'REPOSITORY', status: 'completed', label: 'Repository' },
  { stage: 'ISSUE', status: 'completed', label: 'Issue' },
  { stage: 'RELEVANT_FILES', status: 'completed', label: 'Relevant Files' },
  { stage: 'ROOT_CAUSE', status: 'completed', label: 'Root Cause' },
  { stage: 'EVIDENCE', status: 'completed', label: 'Evidence' },
  { stage: 'SOLUTION', status: 'completed', label: 'Solution' },
  { stage: 'PATCH', status: 'completed', label: 'Patch' },
];

export const mockAnalysis: Analysis = {
  id: 'analysis-1',
  repository: mockRepositories[0],
  issue: mockIssues[0],
  status: 'completed',
  currentStage: 'PATCH',
  stages: mockAnalysisStages,
  relevantFiles: [
    {
      path: 'src/core/thread-pool.ts',
      language: 'TypeScript',
      relevanceScore: 0.95,
      description: 'Main thread pool implementation with memory management',
    },
    {
      path: 'src/utils/memory-tracker.ts',
      language: 'TypeScript',
      relevanceScore: 0.87,
      description: 'Memory tracking utilities for thread allocation',
    },
    {
      path: 'src/core/executor.ts',
      language: 'TypeScript',
      relevanceScore: 0.82,
      description: 'Task execution pipeline with resource cleanup',
    },
    {
      path: 'tests/thread-pool.test.ts',
      language: 'TypeScript',
      relevanceScore: 0.65,
      description: 'Test cases for thread pool functionality',
    },
  ],
  rootCause: {
    summary: 'Memory leak in thread pool executor due to undefined node access',
    description: 'The parseNode function attempts to access node.children without verifying whether node is defined. This occurs when handling asynchronous fallback responses, causing a memory leak when the thread pool executor retains references to undefined nodes.',
    confidence: 0.94,
    affectedFiles: [
      'src/core/thread-pool.ts',
      'src/utils/memory-tracker.ts',
    ],
  },
  evidence: {
    description: 'Code analysis reveals the memory leak originates in the thread pool cleanup routine.',
    evidence: [
      {
        file: 'src/core/thread-pool.ts',
        lineStart: 142,
        lineEnd: 158,
        code: 'const children = node.children;\nfor (const child of children) {\n  await this.releaseMemory(child);\n}',
        explanation: 'The cleanup routine fails to release memory when parseNode encounters undefined nodes.',
        type: 'direct',
      },
      {
        file: 'src/utils/memory-tracker.ts',
        lineStart: 67,
        lineEnd: 75,
        code: 'this.allocations.set(nodeId, size);\nthis.totalAllocated += size;',
        explanation: 'Memory tracker does not account for null node references in the allocation map.',
        type: 'supporting',
      },
    ],
  },
  solution: {
    summary: 'Add null-check validation and proper cleanup',
    description: 'Add null-check validation before accessing node properties and implement proper cleanup in the thread pool executor.',
    steps: [
      'Add null-check in parseNode function',
      'Implement memory release for undefined node references',
      'Add defensive cleanup in thread pool shutdown',
    ],
    affectedFiles: [
      { path: 'src/core/thread-pool.ts', change: 'Add null-check before accessing node.children' },
      { path: 'src/utils/memory-tracker.ts', change: 'Add validation for nodeId parameter' },
    ],
    risks: ['May impact performance slightly due to additional checks'],
    confidence: 0.89,
  },
  patch: {
    summary: 'Fix memory leak in thread pool executor by adding null-check validation and proper cleanup',
    files: [
      {
        path: 'src/core/thread-pool.ts',
        additions: 12,
        deletions: 4,
        hunks: [
          {
            oldStart: 140,
            oldLines: 20,
            newStart: 140,
            newLines: 28,
            lines: [
              { number: 140, content: '  private async cleanupNode(node: Node | undefined): Promise<void> {', isHighlighted: false, type: 'context' },
              { number: 141, content: '    // Previous code - no null check', isHighlighted: false, type: 'context' },
              { number: 142, content: '-   const children = node.children;', isHighlighted: true, type: 'removed' },
              { number: 143, content: '-   for (const child of children) {', isHighlighted: true, type: 'removed' },
              { number: 144, content: '-     await this.releaseMemory(child);', isHighlighted: true, type: 'removed' },
              { number: 145, content: '-   }', isHighlighted: true, type: 'removed' },
              { number: 146, content: '+   if (!node) {', isHighlighted: true, type: 'added' },
              { number: 147, content: '+     return;', isHighlighted: true, type: 'added' },
              { number: 148, content: '+   }', isHighlighted: true, type: 'added' },
              { number: 149, content: '+', isHighlighted: true, type: 'added' },
              { number: 150, content: '+   const children = node.children ?? [];', isHighlighted: true, type: 'added' },
              { number: 151, content: '+   for (const child of children) {', isHighlighted: true, type: 'added' },
              { number: 152, content: '+     await this.releaseMemory(child);', isHighlighted: true, type: 'added' },
              { number: 153, content: '+   }', isHighlighted: true, type: 'added' },
              { number: 154, content: '  }', isHighlighted: false, type: 'context' },
            ],
          },
        ],
      },
      {
        path: 'src/utils/memory-tracker.ts',
        additions: 6,
        deletions: 2,
        hunks: [
          {
            oldStart: 65,
            oldLines: 14,
            newStart: 65,
            newLines: 18,
            lines: [
              { number: 65, content: '  public trackAllocation(nodeId: string, size: number): void {', isHighlighted: false, type: 'context' },
              { number: 66, content: '    // Previous code - no null check', isHighlighted: false, type: 'context' },
              { number: 67, content: '-   this.allocations.set(nodeId, size);', isHighlighted: true, type: 'removed' },
              { number: 68, content: '-   this.totalAllocated += size;', isHighlighted: true, type: 'removed' },
              { number: 69, content: '+   if (!nodeId) {', isHighlighted: true, type: 'added' },
              { number: 70, content: '+     console.warn("Invalid nodeId for allocation tracking");', isHighlighted: true, type: 'added' },
              { number: 71, content: '+     return;', isHighlighted: true, type: 'added' },
              { number: 72, content: '+   }', isHighlighted: true, type: 'added' },
              { number: 73, content: '+', isHighlighted: true, type: 'added' },
              { number: 74, content: '+   this.allocations.set(nodeId, size);', isHighlighted: true, type: 'added' },
              { number: 75, content: '+   this.totalAllocated += size;', isHighlighted: true, type: 'added' },
              { number: 76, content: '  }', isHighlighted: false, type: 'context' },
            ],
          },
        ],
      },
    ],
  },
  startedAt: '2026-08-27T14:30:00Z',
  completedAt: '2026-08-27T14:35:00Z',
};

export const mockRecentAnalyses: Analysis[] = [
  {
    ...mockAnalysis,
    id: 'analysis-1',
    repository: mockRepositories[0],
    issue: mockIssues[0],
  },
  {
    ...mockAnalysis,
    id: 'analysis-2',
    repository: mockRepositories[1],
    issue: mockIssues[1],
    status: 'completed',
    currentStage: 'PATCH',
    stages: mockAnalysisStages,
  },
  {
    ...mockAnalysis,
    id: 'analysis-3',
    repository: mockRepositories[2],
    issue: mockIssues[2],
    status: 'analyzing',
    currentStage: 'ROOT_CAUSE',
    stages: [
      { stage: 'REPOSITORY', status: 'completed', label: 'Repository' },
      { stage: 'ISSUE', status: 'completed', label: 'Issue' },
      { stage: 'RELEVANT_FILES', status: 'completed', label: 'Relevant Files' },
      { stage: 'ROOT_CAUSE', status: 'running', label: 'Root Cause' },
      { stage: 'EVIDENCE', status: 'pending', label: 'Evidence' },
      { stage: 'SOLUTION', status: 'pending', label: 'Solution' },
      { stage: 'PATCH', status: 'pending', label: 'Patch' },
    ],
  },
];

export function getAnalysisById(id: string): Analysis | undefined {
  return mockRecentAnalyses.find(analysis => analysis.id === id);
}
