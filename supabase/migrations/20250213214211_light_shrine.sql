/*
  # Fix user credentials while preserving appointments

  1. Changes
    - Temporarily disable foreign key constraints
    - Reset the default user's password
    - Recreate professional record
    - Re-enable foreign key constraints
  
  2. Security
    - Maintains existing RLS policies
    - No changes to security settings
*/

-- Temporarily disable foreign key checks
ALTER TABLE appointments 
  DROP CONSTRAINT appointments_professional_id_fkey;

-- Remove and recreate the user and professional
DELETE FROM professionals WHERE id = '00000000-0000-0000-0000-000000000000';
DELETE FROM auth.users WHERE email = 'default@example.com';

-- Create the user with the correct password
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
VALUES (
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
);

-- Recreate the professional record
INSERT INTO professionals (id, email, name, phone_number)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  'Default Professional',
  '+5528999283970'
);

-- Re-enable foreign key constraint
ALTER TABLE appointments 
  ADD CONSTRAINT appointments_professional_id_fkey 
  FOREIGN KEY (professional_id) 
  REFERENCES professionals(id);