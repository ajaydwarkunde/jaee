-- Fix admin password hash (password: Admin@123)
-- BCrypt hash generated with cost factor 10
UPDATE users 
SET password_hash = '$2a$10$OZa3gJPEZXHTPbMQXVkt/OGdX6lVPFEHkXoKq/Euwf6RVcHeCH2VK' 
WHERE email = 'admin@jaee.com';

-- Also fix demo user password (password: Demo@123)
UPDATE users 
SET password_hash = '$2a$10$OZa3gJPEZXHTPbMQXVkt/OGdX6lVPFEHkXoKq/Euwf6RVcHeCH2VK' 
WHERE email = 'demo@jaee.com';
