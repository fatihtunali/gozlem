-- Virtual Gifts System Schema

-- Gifts catalog (predefined gift types)
CREATE TABLE IF NOT EXISTS gift_types (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description VARCHAR(100)
);

-- Insert default gift types
INSERT INTO gift_types (id, name, emoji, price, description) VALUES
  ('flower', 'Cicek', '🌸', 2.00, 'Guzel bir cicek'),
  ('heart', 'Kalp', '❤️', 3.00, 'Kalpten kalbe'),
  ('star', 'Yildiz', '⭐', 5.00, 'Parlayan bir yildiz'),
  ('hug', 'Sarilma', '🤗', 3.00, 'Sicacik bir sarilma'),
  ('coffee', 'Kahve', '☕', 4.00, 'Bir fincan kahve'),
  ('diamond', 'Elmas', '💎', 10.00, 'Degerli bir elmas')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  price = EXCLUDED.price,
  description = EXCLUDED.description;

-- Gifts sent to truths
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truth_id UUID NOT NULL REFERENCES truths(id) ON DELETE CASCADE,
  gift_type_id VARCHAR(20) NOT NULL REFERENCES gift_types(id),
  sender_ip_hash VARCHAR(64),
  message VARCHAR(100),
  payment_id UUID REFERENCES payment_logs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_truth ON gifts(truth_id);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON gifts(created_at DESC);

-- Add gift_count columns to truths
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'gift_count') THEN
    ALTER TABLE truths ADD COLUMN gift_count INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'truths' AND column_name = 'gift_value') THEN
    ALTER TABLE truths ADD COLUMN gift_value DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
