/*
  # Fix RLS policies and professional queries

  1. Changes
    - Add default professional if not exists
    - Update RLS policies for appointments table
    - Add policy for public reads of professionals
  
  2. Security
    - Allow public to read professional data
    - Fix appointment insert policy
*/

-- Ensure default professional exists
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

-- Ensure professional exists
INSERT INTO professionals (id, email, name, phone_number)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'default@example.com',
  'Default Professional',
  '+5528999283970'
)
ON CONFLICT (id) DO UPDATE
SET phone_number = EXCLUDED.phone_number;

-- Add policy for public to read professionals
DROP POLICY IF EXISTS "Public can read professionals" ON professionals;
CREATE POLICY "Public can read professionals"
  ON professionals
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Update appointments policies
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
CREATE POLICY "Anyone can insert appointments"
  ON appointments
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read appointments" ON appointments;
CREATE POLICY "Public can read appointments"
  ON appointments
  FOR SELECT
  TO PUBLIC
  USING (true);