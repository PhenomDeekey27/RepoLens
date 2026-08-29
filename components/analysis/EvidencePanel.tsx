import { Evidence } from '@/types';

interface EvidencePanelProps {
  evidence: Evidence;
}

export function EvidencePanel({ evidence }: EvidencePanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-on-surface mb-4">
        Evidence
      </h2>

      <div className="p-4 rounded border border-outline-variant bg-surface-container mb-4">
        <p className="text-sm text-on-surface leading-relaxed">
          {evidence.description}
        </p>
      </div>

      <div className="space-y-4">
        {evidence.codeReferences.map((ref, index) => (
          <div
            key={index}
            className="rounded border border-outline-variant bg-surface-container-low overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant bg-surface-container">
              <span className="text-xs font-mono text-on-surface-variant">
                {ref.file}
              </span>
              <span className="text-xs text-on-surface-variant">
                Lines {ref.startLine}-{ref.endLine}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm text-on-surface-variant">
                {ref.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
