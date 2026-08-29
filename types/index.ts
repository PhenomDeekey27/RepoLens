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
  owner?: string;
  ownerAvatar?: string;
  defaultBranch?: string;
  htmlUrl?: string;
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
  closedAt: string | null;
  comments: number;
  htmlUrl: string;
  userLogin: string;
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

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export interface AnalysisContext {
  repository: Repository;
  issue: Issue;
}

// Database record types
export interface AnalysisRecord {
  id: string;
  user_id: string;
  repository_id: string;
  repository_full_name: string;
  repository_owner: string;
  repository_name: string;
  issue_number: number;
  issue_title: string;
  status:
    | 'queued'
    | 'initializing'
    | 'indexing'
    | 'ready_for_analysis'
    | 'failed'
    | 'completed';
  current_stage:
    | 'issue_context'
    | 'issue_comments'
    | 'repository_tree'
    | 'file_filtering'
    | 'repository_fingerprint'
    | 'ready';
  error_message: string | null;
  total_files: number;
  filtered_files: number;
  fingerprint: RepositoryFingerprint | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface RepositoryFileRecord {
  id: string;
  analysis_id: string;
  path: string;
  file_type: string;
  size: number;
  sha: string;
  language: string;
  is_ignored: boolean;
  created_at: string;
}

export interface AnalysisArtifactRecord {
  id: string;
  analysis_id: string;
  artifact_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

// Analysis initialization types
export interface IssueContext {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  htmlUrl: string;
}

export interface IssueComment {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface RepositoryFingerprint {
  primaryLanguage: string | null;
  framework: string | null;
  packageManager: string | null;
  projectType: string;
  configFiles: string[];
  sourceDirectories: string[];
  testDirectories: string[];
  languages: string[];
  totalFiles: number;
  activeFiles: number;
}
