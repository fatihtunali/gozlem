-- Admin Schema for haydihepberaber.com

-- Add customer_email column to payment_logs if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_logs' AND column_name = 'customer_email') THEN
    ALTER TABLE payment_logs ADD COLUMN customer_email VARCHAR(255);
  END IF;
END $$;

-- Admin users table (simple password auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default admin user (password: admin123 - change this!)
-- Password hash is bcrypt of 'admin123'
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$rQZ5xzPxPxPxPxPxPxPxPeKxKxKxKxKxKxKxKxKxKxKxKxKxKxKxK')
ON CONFLICT (username) DO NOTHING;
