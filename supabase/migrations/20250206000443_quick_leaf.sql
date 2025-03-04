/*
  # Add phone number to professionals

  1. Changes
    - Add phone_number column to professionals table
    - Update default professional with phone number
  
  2. Security
    - No changes to security policies
*/

-- Add phone_number column to professionals
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS phone_number text;

-- Update default professional with phone number
UPDATE professionals 
SET phone_number = '+5528999283970'
WHERE id = '00000000-0000-0000-0000-000000000000';
