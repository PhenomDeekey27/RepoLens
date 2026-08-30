'use client';

import { Patch } from '@/types';
import { Button } from '@/components/ui/button';
import { DiffViewer } from '@/components/code/DiffViewer';
import { toast } from 'sonner';

interface PatchViewerProps {
  patch: Patch;
}

function formatPatchAsDiff(patch: Patch): string {
  const lines: string[] = [];
  lines.push(`# Patch Summary: ${patch.summary}`);
  lines.push('');

  for (const file of patch.files) {
    lines.push(`--- a/${file.path}`);
    lines.push(`+++ b/${file.path}`);
    lines.push(`@@ -0,0 +1,${file.hunks.reduce((acc, h) => acc + h.lines.length, 0)} @@`);

    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'added') {
          lines.push(`+${line.content}`);
        } else if (line.type === 'removed') {
          lines.push(`-${line.content}`);
        } else {
          lines.push(` ${line.content}`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function PatchViewer({ patch }: PatchViewerProps) {
  const handleCopy = async () => {
    try {
      const diff = formatPatchAsDiff(patch);
      await navigator.clipboard.writeText(diff);
      toast.success('Patch copied to clipboard');
    } catch {
      toast.error('Failed to copy patch');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-on-surface">
          Proposed Patch
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="border-outline-variant/50 text-on-surface-variant hover:text-on-surface"
          onClick={handleCopy}
        >
          Copy Patch
        </Button>
      </div>

      <div className="p-4 rounded-lg glass border border-outline-variant/50 mb-4">
        <p className="text-sm text-on-surface leading-relaxed">
          {patch.summary}
        </p>
      </div>

      <div className="space-y-4">
        {patch.files.map((file) => (
          <div
            key={file.path}
            className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/50 bg-surface-container/50">
              <span className="text-xs font-mono text-on-surface-variant">
                {file.path}
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
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
