-- AI Moderation Schema

-- Moderation logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL, -- 'truth' or 'comment'
  content_id UUID NOT NULL,
  content_text TEXT NOT NULL,
  flagged BOOLEAN NOT NULL,
  reason VARCHAR(100),
  confidence DECIMAL(4,3),
  source VARCHAR(20), -- 'ai', 'keyword', 'pattern'
  categories JSONB,
  action_taken VARCHAR(20), -- 'auto_reject', 'pending_review', 'approved'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_flagged ON moderation_logs(flagged) WHERE flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action_taken);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created ON moderation_logs(created_at DESC);

-- Add moderation status to truths
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'moderation_status') THEN
    ALTER TABLE truths ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'approved';
  END IF;
END $$;

-- Add moderation status to comments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'moderation_status') THEN
    ALTER TABLE comments ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'approved';
  END IF;
END $$;
