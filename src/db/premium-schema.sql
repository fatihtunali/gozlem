-- Premium memberships schema
CREATE TABLE IF NOT EXISTS premium_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier VARCHAR(255) NOT NULL, -- fingerprint or email
    plan_type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, expired, cancelled
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    payment_reference VARCHAR(255),
    amount_paid INTEGER NOT NULL, -- in kurus
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_premium_user_identifier ON premium_memberships(user_identifier);
CREATE INDEX IF NOT EXISTS idx_premium_status ON premium_memberships(status, expires_at);

-- Premium benefits tracking
CREATE TABLE IF NOT EXISTS premium_benefits_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID REFERENCES premium_memberships(id) ON DELETE CASCADE,
    benefit_type VARCHAR(100) NOT NULL, -- 'boost', 'extended_confession', 'custom_badge'
    used_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
