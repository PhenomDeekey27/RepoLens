export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  private: boolean;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  createdAt: string;
  updatedAt: string;
  repositoryId: string;
}

export type AnalysisStatus = 'idle' | 'indexing' | 'analyzing' | 'completed' | 'failed';

export type AnalysisStage =
  | 'REPOSITORY'
  | 'ISSUE'
  | 'RELEVANT_FILES'
  | 'ROOT_CAUSE'
  | 'EVIDENCE'
  | 'SOLUTION'
  | 'PATCH';

export interface AnalysisStageInfo {
  stage: AnalysisStage;
  status: 'completed' | 'running' | 'pending' | 'failed';
  label: string;
}

export interface RelevantFile {
  path: string;
  language: string;
  relevanceScore: number;
  description: string;
}

export interface CodeLine {
  number: number;
  content: string;
  isHighlighted: boolean;
  type: 'added' | 'removed' | 'context';
}

export interface CodeFile {
  path: string;
  language: string;
  lines: CodeLine[];
}

export interface RootCause {
  description: string;
  confidence: number;
  affectedFiles: string[];
}

export interface Evidence {
  description: string;
  codeReferences: CodeReference[];
}

export interface CodeReference {
  file: string;
  startLine: number;
  endLine: number;
  explanation: string;
}

export interface Solution {
  description: string;
  approach: string;
}

export interface Patch {
  files: PatchFile[];
  summary: string;
}

export interface PatchFile {
  path: string;
  additions: number;
  deletions: number;
  hunks: PatchHunk[];
}

export interface PatchHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: CodeLine[];
}

export interface Analysis {
  id: string;
  repository: Repository;
  issue: Issue;
  status: AnalysisStatus;
  currentStage: AnalysisStage;
  stages: AnalysisStageInfo[];
  relevantFiles: RelevantFile[];
  rootCause: RootCause | null;
  evidence: Evidence | null;
  solution: Solution | null;
  patch: Patch | null;
  startedAt: string;
  completedAt: string | null;
}

export interface DashboardStats {
  repositories: number;
  issuesAnalyzed: number;
  patchesGenerated: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}
