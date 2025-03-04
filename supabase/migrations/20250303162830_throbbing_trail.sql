/*
  # Update appointments table to support cancelled status
  
  1. Changes
    - Update the check constraint on the status column to include 'cancelled'
  
  2. Security
    - Maintains existing RLS policies
*/

-- Update the check constraint to include 'cancelled' status
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled'));