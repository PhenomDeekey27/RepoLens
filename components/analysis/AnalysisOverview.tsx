'use client';

import { RepositoryFingerprint, IssueContext, IssueComment } from '@/types';
import { Badge } from '@/components/ui/badge';

interface AnalysisOverviewProps {
  fingerprint: RepositoryFingerprint | null;
  issue: IssueContext;
  comments: IssueComment[];
  totalFiles: number;
  filteredFiles: number;
  repositoryFullName: string;
  className?: string;
}

export function AnalysisOverview({
  fingerprint,
  issue,
  comments,
  totalFiles,
  filteredFiles,
  repositoryFullName,
  className,
}: AnalysisOverviewProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="rounded-lg glass border border-outline-variant/50 p-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-3">
          Issue Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono text-primary-container">#{issue.number}</span>
            <span className="text-sm text-on-surface">{issue.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>by @{issue.author}</span>
            <span>·</span>
            <span>{issue.state}</span>
            <span>·</span>
            <span>{comments.length} comments</span>
          </div>
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {issue.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-[10px]">
                  {label}
                </Badge>
              ))}
            </div>
          )}
          {issue.body && (
            <div className="mt-3 p-3 rounded bg-surface-container-low/50 text-xs text-on-surface-variant line-clamp-4">
              {issue.body.slice(0, 500)}
              {issue.body.length > 500 && '...'}
            </div>
          )}
        </div>
      </div>

      {fingerprint && (
        <div className="rounded-lg glass border border-outline-variant/50 p-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Repository Fingerprint
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Language</p>
              <p className="text-xs font-mono text-on-surface">{fingerprint.primaryLanguage || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Framework</p>
              <p className="text-xs font-mono text-on-surface">{fingerprint.framework || 'None detected'}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Package Manager</p>
              <p className="text-xs font-mono text-on-surface">{fingerprint.packageManager || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Project Type</p>
              <p className="text-xs font-mono text-on-surface">{fingerprint.projectType}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Total Files</p>
              <p className="text-xs font-mono text-on-surface">{totalFiles.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant">Active Files</p>
              <p className="text-xs font-mono text-on-surface">{filteredFiles.toLocaleString()}</p>
            </div>
          </div>

          {fingerprint.languages.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-mono text-on-surface-variant mb-1">Languages</p>
              <div className="flex flex-wrap gap-1">
                {fingerprint.languages.slice(0, 8).map((lang) => (
                  <Badge key={lang} variant="outline" className="text-[10px]">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {fingerprint.sourceDirectories.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-mono text-on-surface-variant mb-1">Source Directories</p>
              <div className="flex flex-wrap gap-1">
                {fingerprint.sourceDirectories.map((dir) => (
                  <span key={dir} className="text-[10px] font-mono text-primary-container">
                    {dir}/
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg glass border border-outline-variant/50 p-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-3">
          Repository
        </h3>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant">Full Name</p>
            <p className="text-xs font-mono text-primary-container">{repositoryFullName}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-on-surface-variant">File Count</p>
            <p className="text-xs font-mono text-on-surface">
              {filteredFiles} active / {totalFiles} total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
