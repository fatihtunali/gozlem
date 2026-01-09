-- Push Notification Subscriptions Schema

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_hash VARCHAR(64),
  truth_id UUID REFERENCES truths(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_hash);
CREATE INDEX IF NOT EXISTS idx_push_truth ON push_subscriptions(truth_id);

-- Push notification log
CREATE TABLE IF NOT EXISTS push_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  title VARCHAR(100),
  body TEXT,
  success BOOLEAN,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_logs_sent ON push_logs(sent_at DESC);
