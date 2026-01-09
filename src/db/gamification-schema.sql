-- Gamification Schema: Streaks and Points

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash VARCHAR(64) NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_visit_date DATE,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_hash ON user_streaks(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash VARCHAR(64) NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  confession_points INTEGER DEFAULT 0,
  interaction_points INTEGER DEFAULT 0,
  streak_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_hash ON user_points(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);

-- Points history for tracking
CREATE TABLE IF NOT EXISTS points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash VARCHAR(64) NOT NULL,
  points INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  truth_id UUID REFERENCES truths(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_hash);
CREATE INDEX IF NOT EXISTS idx_points_history_date ON points_history(created_at DESC);

-- Events table for tracking interactions
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash VARCHAR(64) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  truth_id UUID REFERENCES truths(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_ip ON events(ip_hash);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_truth ON events(truth_id);
