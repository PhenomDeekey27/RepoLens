-- Migration: Add model_config column to analyses table
-- This stores the user-selected model configuration for each analysis tier

ALTER TABLE analyses ADD COLUMN IF NOT EXISTS model_config JSONB;

COMMENT ON COLUMN analyses.model_config IS 'User-selected model configuration: { fast: model_id, balanced: model_id, deep: model_id }';
