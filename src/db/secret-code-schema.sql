-- Secret Code System for Anonymous Confession Management

-- Add secret_code column to truths table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'secret_code') THEN
    ALTER TABLE truths ADD COLUMN secret_code VARCHAR(12) UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'owner_email') THEN
    ALTER TABLE truths ADD COLUMN owner_email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'notify_comments') THEN
    ALTER TABLE truths ADD COLUMN notify_comments BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for fast lookup by secret_code
CREATE INDEX IF NOT EXISTS idx_truths_secret_code ON truths(secret_code) WHERE secret_code IS NOT NULL;

-- Generate secret codes for existing confessions (optional - for existing data)
-- UPDATE truths SET secret_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) WHERE secret_code IS NULL;
