import { Patch } from '@/types';
import { Button } from '@/components/ui/button';
import { DiffViewer } from '@/components/code/DiffViewer';

interface PatchViewerProps {
  patch: Patch;
}

export function PatchViewer({ patch }: PatchViewerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-on-surface">
          Proposed Patch
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="border-outline-variant text-on-surface-variant hover:text-on-surface"
        >
          Copy Patch
        </Button>
      </div>

      <div className="p-4 rounded border border-outline-variant bg-surface-container mb-4">
        <p className="text-sm text-on-surface leading-relaxed">
          {patch.summary}
        </p>
      </div>

      <div className="space-y-4">
        {patch.files.map((file) => (
          <div
            key={file.path}
            className="rounded border border-outline-variant bg-surface-container-lowest overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant bg-surface-container">
              <span className="text-xs font-mono text-on-surface-variant">
                {file.path}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">+{file.additions}</span>
                <span className="text-red-400">-{file.deletions}</span>
              </div>
            </div>
            <DiffViewer hunks={file.hunks} />
          </div>
        ))}
      </div>
    </div>
  );
}
