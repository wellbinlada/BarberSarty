/*
  # Reset default user and professional

  1. Changes
    - Update default user credentials
    - Maintain existing appointments
    - Preserve data integrity
  
  2. Security
    - Maintains RLS policies
    - Preserves foreign key relationships
*/

-- First, update the existing user's password if they exist
UPDATE auth.users
SET encrypted_password = crypt('acesso123', gen_salt('bf'))
WHERE email = 'default@example.com';

-- If the user doesn't exist, create them
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  crypt('acesso123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'default@example.com'
);

-- Update or insert the professional record
INSERT INTO professionals (id, email, name, phone_number)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  'Default Professional',
  '+5528999283970'
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  phone_number = EXCLUDED.phone_number;