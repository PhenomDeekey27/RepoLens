'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patch, ApplyFixResult, ApplyFixError } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ApplyFixModalProps {
  analysisId: string;
  repositoryFullName: string;
  issueNumber: number;
  patch: Patch;
  onClose: () => void;
  onSuccess: (result: ApplyFixResult) => void;
}

export function ApplyFixModal({
  analysisId,
  repositoryFullName,
  issueNumber,
  patch,
  onClose,
  onSuccess,
}: ApplyFixModalProps) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setApplying(true);
    setError(null);

    try {
      const response = await fetch(`/api/analyses/${analysisId}/apply`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg =
          (data as ApplyFixError).error || 'Failed to apply fix';
        const isPermissionError =
          (data as ApplyFixError).code === 'insufficient_permissions' ||
          errMsg.includes('404') ||
          errMsg.includes('403');

        if (isPermissionError) {
          setError(
            'GitHub authorization lacks write permission. Please reconnect GitHub with repository access and try again.'
          );
        } else {
          setError(errMsg);
        }
        toast.error(errMsg);
        return;
      }

      toast.success('Fix applied successfully!');
      onSuccess(data as ApplyFixResult);
    } catch {
      const errMsg = 'An unexpected error occurred while applying the fix.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!applying ? onClose : undefined}
      />

      <div className="relative glass-strong border border-outline-variant/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-lg font-semibold text-on-surface mb-2">
          Create Fix Branch?
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          This will create a new branch from the repository&apos;s default
          branch and apply the proposed changes.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant w-20 shrink-0">
              Repository
            </span>
            <span className="text-sm font-mono text-on-surface">
              {repositoryFullName}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant w-20 shrink-0">
              Base
            </span>
            <span className="text-sm font-mono text-on-surface">main</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant w-20 shrink-0">
              Branch
            </span>
            <span className="text-sm font-mono text-primary-container">
              repolens/fix/issue-{issueNumber}-*
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant w-20 shrink-0">
              Files
            </span>
            <div className="text-sm font-mono text-on-surface">
              {patch.files.map((f) => (
                <div key={f.path} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  <span>{f.path}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error-container/20 border border-error-container/50 mb-4">
            <p className="text-sm text-error-default">{error}</p>
            {error.includes('write permission') && (
              <button
                onClick={() => {
                  router.push('/auth/github');
                }}
                className="mt-2 text-xs text-primary-container hover:underline"
              >
                Reconnect GitHub →
              </button>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-outline-variant/50 text-on-surface-variant"
            onClick={onClose}
            disabled={applying}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="gradient-primary text-white hover:gradient-primary-hover font-medium"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Applying...
              </span>
            ) : (
              'Create Branch & Apply Fix'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
