-- Gozlem Game API Database Schema

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locale VARCHAR(10) NOT NULL DEFAULT 'tr',
  client_fingerprint VARCHAR(256),
  state JSONB NOT NULL,
  metadata JSONB
);

-- Events table (choice history)
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(50) PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prompt_id VARCHAR(50) NOT NULL,
  choice_id VARCHAR(40) NOT NULL,
  category VARCHAR(20) NOT NULL,
  feedback_text VARCHAR(300) NOT NULL,
  feedback_tone VARCHAR(20) NOT NULL,
  social_hint VARCHAR(200),
  pattern_detected BOOLEAN NOT NULL DEFAULT FALSE,
  milestone_triggered VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);

-- Idempotency keys table
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(128) PRIMARY KEY,
  session_id UUID NOT NULL,
  request_hash VARCHAR(64) NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys(created_at);
