/*
  # Create CMS tables for Admin panel

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting identifier like "hero_title", "hero_subtitle"
      - `value` (text) - the setting value
      - `updated_at` (timestamp)
    - `services`
      - `id` (uuid, primary key)
      - `code` (text, unique) - e.g. "LMT", "CST"
      - `title` (text)
      - `description` (text)
      - `full_description` (text)
      - `image_url` (text)
      - `sort_order` (int, default 0)
      - `is_active` (bool, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `programmes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - e.g. "LMT 100"
      - `title` (text)
      - `days` (int, default 1)
      - `category` (text)
      - `is_active` (bool, default true)
      - `is_featured` (bool, default false)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `stats`
      - `id` (uuid, primary key)
      - `value` (text) - display value like "500+"
      - `label` (text) - label like "Professionals Trained"
      - `sort_order` (int, default 0)
      - `is_active` (bool, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public can read active items
    - Only authenticated admin users can insert/update/delete

  3. Important Notes
    - All tables use UUIDs for primary keys
    - `is_active` flags allow soft-delete / toggle visibility
    - `sort_order` controls display ordering
*/

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public anon can read site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read all services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Programmes
CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  days int NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'General',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active programmes"
  ON programmes FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read all programmes"
  ON programmes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert programmes"
  ON programmes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update programmes"
  ON programmes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete programmes"
  ON programmes FOR DELETE
  TO authenticated
  USING (true);

-- Stats
CREATE TABLE IF NOT EXISTS stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active stats"
  ON stats FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read all stats"
  ON stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert stats"
  ON stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update stats"
  ON stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete stats"
  ON stats FOR DELETE
  TO authenticated
  USING (true);
