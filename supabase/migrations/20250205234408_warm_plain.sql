/*
  # Initial Schema for Scheduling System

  1. New Tables
    - `professionals` - Stores professional user data
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `appointments` - Stores appointment data
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `date` (date)
      - `time` (time)
      - `professional_id` (uuid, foreign key)
      - `status` (text) - Can be 'pending' or 'confirmed'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for professionals to manage their appointments
*/

-- Create professionals table
CREATE TABLE professionals (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  professional_id uuid REFERENCES professionals(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for professionals table
CREATE POLICY "Professionals can read own data"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policies for appointments table
CREATE POLICY "Professionals can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Anyone can insert appointments"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

