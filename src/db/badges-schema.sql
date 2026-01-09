-- Badges Schema

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(50) DEFAULT 'achievement',
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badges (awarded badges)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash VARCHAR(64) NOT NULL,
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id),
  truth_id UUID REFERENCES truths(id) ON DELETE SET NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_hash, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_hash);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded ON user_badges(awarded_at DESC);

-- Insert default badges
INSERT INTO badges (id, name, description, icon, category, requirement_type, requirement_value) VALUES
('first_confession', 'Ilk Adim', 'Ilk itirafini paylastin', '🌱', 'achievement', 'confession_count', 1),
('five_confessions', 'Aciliyorum', '5 itiraf paylastin', '🌿', 'achievement', 'confession_count', 5),
('ten_confessions', 'Cesur Kalp', '10 itiraf paylastin', '💚', 'achievement', 'confession_count', 10),
('first_hug', 'Ilk Sarilma', 'Birine ilk kez sarildin', '🤗', 'social', 'hug_given_count', 1),
('hundred_hugs', 'Sarilma Ustasi', '100 kez sarildin', '🫂', 'social', 'hug_given_count', 100),
('five_hundred_hugs', 'Sarilma Efsanesi', '500 kez sarildin', '💜', 'social', 'hug_given_count', 500),
('first_me_too', 'Ben de!', 'Ilk "ben de" dediniz', '✋', 'social', 'metoo_given_count', 1),
('hundred_metoo', 'Empati Ustasi', '100 kez "ben de" dediniz', '🤝', 'social', 'metoo_given_count', 100),
('received_hundred_hugs', 'Seviliyorsun', '100 sarilma aldin', '💗', 'popularity', 'hug_received_count', 100),
('weekly_champion', 'Haftanin Yildizi', 'Haftanin en cok etkilesim alan itirafina sahipsin', '⭐', 'special', 'weekly_top', 1),
('night_owl', 'Gece Kusu', 'Gece yarisi itiraf paylastin', '🦉', 'special', 'night_confession', 1),
('early_bird', 'Erkenci Kus', 'Sabah 6da itiraf paylastin', '🐦', 'special', 'morning_confession', 1),
('trendsetter', 'Trend Belirleyici', 'Hashtag iniz trending oldu', '🔥', 'special', 'trending_hashtag', 1),
('gift_giver', 'Cömert Kalp', 'Ilk hediyeni gönderdin', '🎁', 'social', 'gift_given_count', 1)
ON CONFLICT (id) DO NOTHING;
