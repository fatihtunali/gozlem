-- Hashtag System Schema

-- Hashtags table (stores unique hashtags)
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag VARCHAR(50) NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage ON hashtags(usage_count DESC);

-- Truth-Hashtag junction table
CREATE TABLE IF NOT EXISTS truth_hashtags (
  truth_id UUID NOT NULL REFERENCES truths(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (truth_id, hashtag_id)
);

CREATE INDEX IF NOT EXISTS idx_truth_hashtags_truth ON truth_hashtags(truth_id);
CREATE INDEX IF NOT EXISTS idx_truth_hashtags_hashtag ON truth_hashtags(hashtag_id);

-- Function to extract and link hashtags from content
CREATE OR REPLACE FUNCTION process_hashtags(truth_id_param UUID, content_param TEXT)
RETURNS void AS $$
DECLARE
  hashtag_match TEXT;
  hashtag_id_var UUID;
BEGIN
  -- Extract all hashtags from content (Turkish chars supported)
  FOR hashtag_match IN
    SELECT DISTINCT LOWER(SUBSTRING(match FROM 2))
    FROM regexp_matches(content_param, '#([a-zA-Z0-9\u00e7\u011f\u0131\u00f6\u015f\u00fc\u00c7\u011e\u0130\u00d6\u015e\u00dc_]+)', 'g') AS match
  LOOP
    -- Insert hashtag if not exists, or get existing id
    INSERT INTO hashtags (tag, usage_count)
    VALUES (hashtag_match, 1)
    ON CONFLICT (tag) DO UPDATE SET usage_count = hashtags.usage_count + 1
    RETURNING id INTO hashtag_id_var;

    -- Link truth to hashtag
    INSERT INTO truth_hashtags (truth_id, hashtag_id)
    VALUES (truth_id_param, hashtag_id_var)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
