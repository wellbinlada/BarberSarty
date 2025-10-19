/*
  # Ensure barber@admin.com professional exists with correct ID
  
  1. Changes
    - Create or update professional record for barber@admin.com
    - Ensure the professional_id matches the auth user ID
    - Update existing appointments to use the correct professional_id
  
  2. Security
    - Maintains existing RLS policies
*/

-- First, get the auth user ID for barber@admin.com
DO $$
DECLARE
  auth_user_id UUID;
  existing_prof_id UUID;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'barber@admin.com';
  
  IF auth_user_id IS NOT NULL THEN
    -- Check if professional already exists with this email
    SELECT id INTO existing_prof_id 
    FROM professionals 
    WHERE email = 'barber@admin.com';
    
    -- First, delete any existing professional with this email but different ID
    IF existing_prof_id IS NOT NULL AND existing_prof_id != auth_user_id THEN
      DELETE FROM professionals WHERE id = existing_prof_id;
      RAISE NOTICE 'Deleted old professional record with ID: %', existing_prof_id;
    END IF;
    
    -- Now create or update the professional record with correct ID
    INSERT INTO professionals (id, email, name, phone_number)
    VALUES (auth_user_id, 'barber@admin.com', 'Barber Admin', '+5528999283970')
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      phone_number = EXCLUDED.phone_number;
    
    RAISE NOTICE 'Professional record created/updated for barber@admin.com with ID: %', auth_user_id;
    
    -- Now update all appointments to use the correct professional_id
    UPDATE appointments 
    SET professional_id = auth_user_id
    WHERE professional_id = '00000000-0000-0000-0000-000000000000'
       OR (existing_prof_id IS NOT NULL AND professional_id = existing_prof_id);
    
    RAISE NOTICE 'Updated appointments to use professional_id: %', auth_user_id;
    
  ELSE
    RAISE NOTICE 'Auth user barber@admin.com not found';
  END IF;
END $$;
