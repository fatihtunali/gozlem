-- Payment and Boost Schema for haydihepberaber.com

-- Add boost columns to truths table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'is_boosted') THEN
    ALTER TABLE truths ADD COLUMN is_boosted BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'boost_ends_at') THEN
    ALTER TABLE truths ADD COLUMN boost_ends_at TIMESTAMPTZ;
  END IF;
END $$;

-- Payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) UNIQUE NOT NULL,
  truth_id UUID REFERENCES truths(id) ON DELETE SET NULL,
  transaction_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  boost_duration VARCHAR(20),
  customer_ip VARCHAR(45),
  md_status VARCHAR(10),
  proc_return_code VARCHAR(10),
  error_message TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes on payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_truth_id ON payment_logs(truth_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Boosts table
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truth_id UUID NOT NULL REFERENCES truths(id) ON DELETE CASCADE,
  order_id VARCHAR(100) REFERENCES payment_logs(order_id),
  boost_type VARCHAR(20) NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes on boosts
CREATE INDEX IF NOT EXISTS idx_boosts_truth_id ON boosts(truth_id);
CREATE INDEX IF NOT EXISTS idx_boosts_ends_at ON boosts(ends_at);

-- Create index on truths for boosted confessions
CREATE INDEX IF NOT EXISTS idx_truths_is_boosted ON truths(is_boosted) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_truths_boost_ends_at ON truths(boost_ends_at) WHERE boost_ends_at IS NOT NULL;

-- Function to expire boosts
CREATE OR REPLACE FUNCTION expire_boosts()
RETURNS void AS $$
BEGIN
  UPDATE truths
  SET is_boosted = false, boost_ends_at = NULL
  WHERE is_boosted = true AND boost_ends_at < NOW();
END;
$$ LANGUAGE plpgsql;
