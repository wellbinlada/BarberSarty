/*
  # Create default professional and auth user

  1. Changes
    - Create default auth user
    - Create default professional linked to auth user
  
  2. Security
    - No changes to security policies
*/

-- First create the auth user
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
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  crypt('default123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Then create the professional
INSERT INTO professionals (id, email, name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  'Default Professional',
  now()
)
ON CONFLICT (id) DO NOTHING;