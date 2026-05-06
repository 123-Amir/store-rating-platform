/*
  # Create Store Rating Platform Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, 20-60 chars)
      - `email` (text, unique)
      - `address` (text, max 400 chars)
      - `role` (text: 'system_admin', 'normal_user', 'store_owner')
      - `created_at` (timestamptz)
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text, 20-60 chars)
      - `email` (text)
      - `address` (text, max 400 chars)
      - `owner_id` (uuid, references users)
      - `created_at` (timestamptz)
    - `ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `store_id` (uuid, references stores)
      - `rating` (integer, 1-5)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, store_id)

  2. Security
    - Enable RLS on all tables
    - System admins can CRUD all
    - Normal users can read stores, create/update own ratings
    - Store owners can read their own store's ratings
    - Users can update their own profile (password/address)

  3. Indexes
    - Index on stores.owner_id
    - Index on ratings.store_id
    - Index on ratings.user_id
*/

-- Create users table (extends auth.users)
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (char_length(name) >= 20 AND char_length(name) <= 60),
    email text UNIQUE NOT NULL,
    address text NOT NULL CHECK (char_length(address) <= 400),
    role text NOT NULL DEFAULT 'normal_user' CHECK (role IN ('system_admin', 'normal_user', 'store_owner')),
    created_at timestamptz DEFAULT now()
  );

  -- Create stores table
  CREATE TABLE IF NOT EXISTS stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (char_length(name) >= 20 AND char_length(name) <= 60),
    email text NOT NULL,
    address text NOT NULL CHECK (char_length(address) <= 400),
    owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Create ratings table
  CREATE TABLE IF NOT EXISTS ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, store_id)
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
  CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
  CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

  -- Enable RLS
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

  -- Users policies
  CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Admins can read all users"
    ON users FOR SELECT
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  CREATE POLICY "Admins can update any user"
    ON users FOR UPDATE
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  -- Stores policies
  CREATE POLICY "Anyone can read stores"
    ON stores FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Admins can insert stores"
    ON stores FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  CREATE POLICY "Admins can update stores"
    ON stores FOR UPDATE
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  CREATE POLICY "Admins can delete stores"
    ON stores FOR DELETE
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
    );

  -- Ratings policies
  CREATE POLICY "Users can read all ratings"
    ON ratings FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Normal users can insert own ratings"
    ON ratings FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'normal_user')
    );

  CREATE POLICY "Users can update own ratings"
    ON ratings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own ratings"
    ON ratings FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Function to auto-create user profile on signup
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.users (id, name, email, address, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'normal_user')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Trigger for auto-creating user profile
  CREATE OR REPLACE FUNCTION public.handle_new_user_trigger()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.users (id, name, email, address, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'normal_user')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trigger();
