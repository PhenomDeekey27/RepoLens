import { RelevantFile } from '@/types';

interface RelevantFilesPanelProps {
  files: RelevantFile[];
}

export function RelevantFilesPanel({ files }: RelevantFilesPanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Relevant Files
      </h2>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.path}
            className="p-3 rounded border border-outline-variant bg-surface-container"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono text-primary-container">
                {file.path}
              </span>
              <span className="text-xs text-on-surface-variant">
                {Math.round(file.relevanceScore * 100)}% relevance
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {file.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
