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

-- ============================================
-- İtiraf Duvarı (Confession Wall) Tables
-- ============================================

-- Truths/Confessions table
CREATE TABLE IF NOT EXISTS truths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  me_too_count INTEGER NOT NULL DEFAULT 0,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_truths_created ON truths(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_truths_me_too ON truths(me_too_count DESC);

-- Me too votes (to prevent duplicate voting)
CREATE TABLE IF NOT EXISTS me_too_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truth_id UUID NOT NULL REFERENCES truths(id) ON DELETE CASCADE,
  voter_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(truth_id, voter_hash)
);

CREATE INDEX IF NOT EXISTS idx_me_too_truth ON me_too_votes(truth_id);
