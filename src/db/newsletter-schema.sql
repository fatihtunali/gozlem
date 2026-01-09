-- Newsletter Subscribers Schema

-- Subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);

-- Newsletter send log (to track weekly digest sends)
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscriber_count INTEGER NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent ON newsletter_logs(sent_at DESC);
