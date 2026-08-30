-- Migration 004: Extend for AI investigation pipeline
-- This migration adds support for the new AI investigation stages and artifact types.

-- Update analysis_artifacts CHECK constraint to include new artifact types
ALTER TABLE analysis_artifacts DROP CONSTRAINT IF EXISTS analysis_artifacts_artifact_type_check;

ALTER TABLE analysis_artifacts ADD CONSTRAINT analysis_artifacts_artifact_type_check
  CHECK (artifact_type IN (
    'issue_context',
    'issue_comments',
    'repository_tree',
    'fingerprint',
    'relevant_files',
    'source_files',
    'root_cause',
    'evidence',
    'solution',
    'patch'
  ));

-- Update analyses status CHECK constraint to include new statuses
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_status_check;

ALTER TABLE analyses ADD CONSTRAINT analyses_status_check
  CHECK (status IN (
    'queued',
    'initializing',
    'indexing',
    'ready_for_analysis',
    'relevant_file_discovery',
    'relevant_files_ready',
    'root_cause_complete',
    'evidence_complete',
    'solution_complete',
    'completed',
    'failed'
  ));

-- Update analyses current_stage CHECK constraint to include new stages
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_current_stage_check;

ALTER TABLE analyses ADD CONSTRAINT analyses_current_stage_check
  CHECK (current_stage IN (
    'issue_context',
    'issue_comments',
    'repository_tree',
    'file_filtering',
    'repository_fingerprint',
    'ready',
    'relevant_files_discovery',
    'relevant_files_fetch',
    'relevant_files_complete',
    'root_cause_analysis',
    'evidence_extraction',
    'solution_generation',
    'patch_generation',
    'completed'
  ));
