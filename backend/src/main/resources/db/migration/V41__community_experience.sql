CREATE TABLE community_experiences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users (id) ON DELETE SET NULL,
    author_name VARCHAR(120) NOT NULL,
    location VARCHAR(120),
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    curated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ce_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_ce_user_id ON community_experiences (user_id);
CREATE INDEX idx_ce_status ON community_experiences (status);
CREATE INDEX idx_ce_created ON community_experiences (created_at DESC);

INSERT INTO community_experiences (user_id, author_name, location, body, status, curated)
VALUES
(
    NULL,
    'Priya M.',
    'Pune',
    'The candles from Jaai are absolutely divine — the fragrance fills the room and lasts for hours.',
    'APPROVED',
    TRUE
),
(
    NULL,
    'Rahul K.',
    'Delhi',
    'Best quality I''ve found in India. Clean burn, subtle scents, and beautiful packaging every time.',
    'APPROVED',
    TRUE
);

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'community_experience_enabled', 'true', 'BOOLEAN', 'Show “Share Your Experience” on homepage'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'community_experience_enabled');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'community_experience_require_login', 'true', 'BOOLEAN', 'Require sign-in to post an experience'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'community_experience_require_login');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'community_experience_auto_approve', 'false', 'BOOLEAN', 'Auto-approve new posts (otherwise pending moderation)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'community_experience_auto_approve');
