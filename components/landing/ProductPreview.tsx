export function ProductPreview() {
  return (
    <section className="px-4 py-12 md:py-16 max-w-5xl mx-auto">
      <div className="rounded-xl glass-strong border border-outline-variant/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/50 bg-surface-container/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-on-surface-variant ml-2">
            RepoLens — Investigation Workspace
          </span>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-outline-variant/50 bg-surface-container/30 p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-on-surface">
                <span className="text-green-500">✓</span>
                <span>Repository</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface">
                <span className="text-green-500">✓</span>
                <span>Issue</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface">
                <span className="text-green-500">✓</span>
                <span>Relevant Files</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-container">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span>Root Cause</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-surface-bright" />
                <span>Solution</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-surface-bright" />
                <span>Patch</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-primary-container">acme/core-engine</span>
                <span className="text-on-surface-variant">/</span>
                <span className="text-sm font-mono text-on-surface">#402</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Memory leak in thread pool executor
              </p>
            </div>

            <div className="mb-4 p-3 rounded-lg glass border border-outline-variant/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                  Root Cause Identified
                </span>
                <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-primary-container/20 text-primary-container">
                  94% confidence
                </span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">
                The parseNode function attempts to access node.children without verifying whether node is defined.
              </p>
            </div>

            <div className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/50 bg-surface-container/50">
                <span className="text-xs font-mono text-on-surface-variant">
                  src/core/thread-pool.ts
                </span>
              </div>
              <div className="p-3 font-mono text-xs">
                <div className="flex">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">140</span>
                  <span className="text-on-surface-variant">private async cleanupNode(node: Node | undefined) {'{'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">141</span>
                  <span className="text-on-surface-variant">  {'// Previous code - no null check'}</span>
                </div>
                <div className="flex bg-red-500/10">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">142</span>
                  <span className="text-red-400">- const children = node.children;</span>
                </div>
                <div className="flex bg-green-500/10">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">143</span>
                  <span className="text-green-400">+ if (!node) {'{'}</span>
                </div>
                <div className="flex bg-green-500/10">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">144</span>
                  <span className="text-green-400">+   return;</span>
                </div>
                <div className="flex bg-green-500/10">
                  <span className="w-8 text-right pr-3 text-on-surface-variant select-none">145</span>
                  <span className="text-green-400">+ {'}'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
