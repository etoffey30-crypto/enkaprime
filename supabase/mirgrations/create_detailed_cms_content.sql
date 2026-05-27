/*
  # Comprehensive CMS for Full Page Content Management

  1. New Tables
    - `pages` - Master page definitions (home, about, services, contact)
    - `page_sections` - Individual sections on each page with content and images
    - `hero_banners` - Hero/banner content with images, titles, descriptions
    - `media_library` - Centralized image/media management
    - `content_blocks` - Reusable content blocks (features, testimonials, CTA, etc)
    - `faqs` - FAQ content
    - `team_members` - Team member profiles with photos
    - `footer_content` - Footer customization

  2. Security
    - RLS enabled on all tables
    - Public can read active content
    - Only authenticated users can create/edit/delete
*/

-- Media Library (centralized image management)
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  category text DEFAULT 'General',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active media"
  ON media_library FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read all media"
  ON media_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (true);

-- Hero Banners
CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text DEFAULT '',
  description text DEFAULT '',
  cta_text text DEFAULT 'Learn More',
  cta_link text DEFAULT '#',
  image_url text NOT NULL,
  overlay_color text DEFAULT '#0F2044',
  overlay_opacity numeric DEFAULT 0.85,
  text_color text DEFAULT '#ffffff',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active heroes"
  ON hero_banners FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage heroes"
  ON hero_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Page Sections
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_type text NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  description text DEFAULT '',
  content text DEFAULT '',
  image_url text DEFAULT '',
  image_alt text DEFAULT '',
  cta_text text DEFAULT '',
  cta_link text DEFAULT '#',
  sort_order int DEFAULT 0,
  layout text DEFAULT 'default',
  background_color text DEFAULT '#ffffff',
  text_alignment text DEFAULT 'left',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active sections"
  ON page_sections FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage sections"
  ON page_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Content Blocks (reusable features, testimonials, etc)
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  icon_name text DEFAULT '',
  link_text text DEFAULT '',
  link_url text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active blocks"
  ON content_blocks FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage blocks"
  ON content_blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FAQ
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active faqs"
  ON faqs FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage faqs"
  ON faqs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  bio text DEFAULT '',
  image_url text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  specialty text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active team"
  ON team_members FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage team"
  ON team_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Footer Content
CREATE TABLE IF NOT EXISTS footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  type text DEFAULT 'text',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read footer"
  ON footer_content FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage footer"
  ON footer_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
