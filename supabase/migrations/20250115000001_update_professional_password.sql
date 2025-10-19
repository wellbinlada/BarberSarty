/*
  # Update professional password to 123456
  
  1. Changes
    - Update the default professional's password to 123456
    - This makes it easier for testing and development
  
  2. Security
    - This is for development/testing purposes only
    - In production, use a strong password
*/

-- Update the password for the default professional user
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'barber@admin.com';

-- Verify the update
SELECT email, 
       CASE 
         WHEN encrypted_password IS NOT NULL THEN 'Password updated'
         ELSE 'No password set'
       END as password_status
FROM auth.users 
WHERE email = 'barber@admin.com';
