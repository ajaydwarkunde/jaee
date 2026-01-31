-- Add Two-Factor Authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- Add index for 2FA queries
CREATE INDEX IF NOT EXISTS idx_users_2fa ON users(two_factor_enabled);
