-- Add patch application fields to analyses table

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS patch_status TEXT DEFAULT 'none'
    CHECK (patch_status IN ('none', 'pending', 'applied', 'failed')),
  ADD COLUMN IF NOT EXISTS created_branch TEXT,
  ADD COLUMN IF NOT EXISTS commit_sha TEXT,
  ADD COLUMN IF NOT EXISTS commit_message TEXT,
  ADD COLUMN IF NOT EXISTS changed_files JSONB,
  ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;

-- Index for quick lookup of applied patches
CREATE INDEX IF NOT EXISTS idx_analyses_patch_status ON analyses(patch_status);
