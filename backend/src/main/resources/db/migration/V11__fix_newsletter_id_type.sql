-- Fix newsletter_subscribers id column type from INTEGER to BIGINT
ALTER TABLE newsletter_subscribers ALTER COLUMN id TYPE BIGINT;
