/*
  # Update auth user for barber@admin.com

  1. Changes
    - Update the default user's email to barber@admin.com if not already set
    - Update the professional record to match the new email
  
  2. Security
    - Maintains existing RLS policies
*/

-- Check if barber@admin.com already exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the email already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'barber@admin.com'
  ) INTO user_exists;
  
  -- If the email doesn't exist, update the default user
  IF NOT user_exists THEN
    UPDATE auth.users
    SET email = 'barber@admin.com'
    WHERE id = '00000000-0000-0000-0000-000000000000';
  END IF;
END $$;

-- Update the professional record to ensure it matches
UPDATE professionals
SET email = 'barber@admin.com',
    name = 'Barber Admin'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Ensure the professional exists with barber@admin.com
INSERT INTO professionals (id, email, name, phone_number)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'barber@admin.com',
  'Barber Admin',
  '+5528999283970'
WHERE NOT EXISTS (
  SELECT 1 FROM professionals WHERE email = 'barber@admin.com'
)
ON CONFLICT (id) DO NOTHING;