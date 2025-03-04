/*
  # Prevent duplicate appointments

  1. Changes
    - Remove duplicate appointments keeping only the latest one
    - Add unique constraint to appointments table to prevent duplicate date/time combinations
    - Update insert policy to prevent double booking
  
  2. Security
    - Add policy to prevent double booking
*/

-- First, create a temporary table to store the latest appointments for each time slot
CREATE TEMP TABLE latest_appointments AS
SELECT DISTINCT ON (professional_id, date, time)
  id,
  professional_id,
  date,
  time
FROM appointments
ORDER BY professional_id, date, time, created_at DESC;

-- Delete duplicates, keeping only the latest appointments
DELETE FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM latest_appointments la
  WHERE la.id = a.id
);

-- Now it's safe to add the unique constraint
ALTER TABLE appointments 
ADD CONSTRAINT unique_appointment_datetime 
UNIQUE (professional_id, date, time);

-- Update the insert policy to check for existing appointments
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;

CREATE POLICY "Anyone can insert appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 
      FROM appointments a 
      WHERE a.professional_id = appointments.professional_id 
      AND a.date = appointments.date 
      AND a.time = appointments.time
    )
  );

-- Clean up
DROP TABLE latest_appointments;