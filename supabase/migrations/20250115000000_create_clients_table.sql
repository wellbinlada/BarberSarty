/*
  # Create clients table for customer registration and authentication
  
  1. New Tables
    - `clients` - Stores client user data
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on clients table
    - Add policies for clients to manage their own data
    - Allow anonymous users to insert new clients (for registration)
*/

-- Create clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert new clients"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create function to automatically create client record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.clients (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create client record
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_client();

-- Update appointments table to support client_id
ALTER TABLE appointments 
ADD COLUMN client_id uuid REFERENCES clients(id) ON DELETE SET NULL;

-- Update appointments policies to allow clients to read their own appointments
CREATE POLICY "Clients can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Update existing appointments to have null client_id (they were created before client system)
-- This is safe since we're not changing existing data, just adding the column

