-- Migration 006: Add model_execution artifact type and fix status constraints
-- The model execution tracker stores AI model attempt records as artifacts.
-- Also add 'relevant_files_fetch' and 'relevant_files_discovery' to status check.

-- Update analysis_artifacts CHECK constraint to include model_execution
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
    'patch',
    'model_execution'
  ));

-- Update analyses status CHECK to include relevant_files_fetch and relevant_files_discovery
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_status_check;

ALTER TABLE analyses ADD CONSTRAINT analyses_status_check
  CHECK (status IN (
    'queued',
    'initializing',
    'indexing',
    'ready_for_analysis',
    'relevant_file_discovery',
    'relevant_files_fetch',
    'relevant_files_discovery',
    'relevant_files_ready',
    'analyzing',
    'root_cause_complete',
    'evidence_complete',
    'solution_complete',
    'completed',
    'failed'
  ));
