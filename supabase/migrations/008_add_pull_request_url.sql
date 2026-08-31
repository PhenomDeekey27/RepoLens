-- Add pull request URL to analyses table

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS pull_request_url TEXT;
