ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX idx_users_provider ON users(auth_provider, provider_id) WHERE provider_id IS NOT NULL;
