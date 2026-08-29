-- Migration 002: Extend analysis_artifacts for AI pipeline
-- This migration adds support for new artifact types used by the AI analysis pipeline.

-- Drop existing CHECK constraint and add new one with additional types
ALTER TABLE analysis_artifacts DROP CONSTRAINT IF EXISTS analysis_artifacts_artifact_type_check;

ALTER TABLE analysis_artifacts ADD CONSTRAINT analysis_artifacts_artifact_type_check
  CHECK (artifact_type IN (
    'issue_context',
    'issue_comments',
    'repository_tree',
    'fingerprint',
    'relevant_files',
    'source_files'
  ));

-- Add AI metadata columns to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_provider TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_model TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_tier TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_tokens_input INTEGER;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_tokens_output INTEGER;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS ai_duration_ms INTEGER;
