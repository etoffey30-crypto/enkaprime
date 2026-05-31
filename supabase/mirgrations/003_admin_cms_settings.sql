/*
  # Admin CMS Settings - Write Policies & Seed Data
  Migration 003: site_settings insert/update/delete policies
  + default seed data for the Admin CMS Dynamic System.

  Run this in the Supabase SQL Editor AFTER migrations 001 and 002.
*/

-- ─── site_settings write policies (admin authenticated users) ───
CREATE POLICY "Authenticated can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (true);

-- ─── Default seed values for key CMS settings ───
INSERT INTO site_settings (key, value) VALUES
  -- Hero Section
  ('hero_title', 'Transforming Organisations Through'),
  ('hero_badge_text', 'Premier Corporate Training Partner'),
  ('hero_description', 'Enka Prime Consulting delivers world-class in-house corporate training programmes across Ghana and West Africa. From leadership development to HSE compliance, we equip professionals with the skills that drive measurable results.'),
  ('hero_rotator_words', 'Performance,Leadership,Excellence,Compliance,Growth'),
  ('hero_image', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg'),
  ('hero_widget_left_title', '500+ Professionals Trained'),
  ('hero_widget_right_title', 'In-House Delivery'),
  ('hero_widget_right_desc', 'Nationwide, at your premises'),

  -- About Section
  ('about_title', 'Empowering Professionals Across West Africa'),
  ('about_tagline', 'Empowering People. Enhancing Performance. Delivering Excellence.'),
  ('about_description', 'Enka Prime Consulting Ltd is a premier corporate training and consulting firm dedicated to developing human capital across public and private sector organisations in Ghana and the wider West African region.'),
  ('about_extended', 'Our team of seasoned professionals brings decades of hands-on experience across leadership, safety, finance, and technology — designing bespoke training programmes that directly address your organisation''s challenges and goals.'),
  ('about_bullets', 'ISO-Aligned Training Methodology,Nationally Certified Trainers,Tailored In-House Curriculum,Post-Training Performance Support'),
  ('about_pull_quote', 'We don''t just train — we transform organisational performance from the ground up.'),

  -- Contact Details
  ('contact_email', 'info@enkaprime.com'),
  ('contact_phone', '0200 769 146'),
  ('contact_location', 'In-House — Nationwide Delivery Across Ghana'),

  -- CTA Section
  ('cta_title', 'Ready to Upskill Your'),
  ('cta_discipline_highlight', 'Workforce?'),
  ('cta_description', 'All programmes delivered in-house at your organisation. Contact us to discuss your specific training requirements and schedule.'),

  -- Design System (JSON)
  ('design_system', '{"primary_color":"#0F2044","secondary_color":"#C9A84C","accent_color":"#F3F4F6","font_family":"Inter","base_font_size":"16px","spacing_density":"comfortable","button_preset":"rounded"}'),

  -- Navigation Menu (JSON)
  ('navigation_menu', '[{"id":"1","label":"Home","href":"home","link_type":"page","is_active":true},{"id":"2","label":"Services","href":"services","link_type":"page","is_active":true},{"id":"3","label":"Programmes","href":"programmes","link_type":"page","is_active":true},{"id":"4","label":"About","href":"about","link_type":"page","is_active":true},{"id":"5","label":"Contact","href":"contact","link_type":"page","is_active":true}]'),

  -- Homepage Modules (JSON)
  ('homepage_modules', '[{"id":"hero","label":"Hero Banner","is_visible":true,"order":1},{"id":"stats","label":"Stats Bar","is_visible":true,"order":2},{"id":"about","label":"About Preview","is_visible":true,"order":3},{"id":"services","label":"Services Section","is_visible":true,"order":4},{"id":"industries","label":"Industries We Serve","is_visible":true,"order":5},{"id":"why","label":"Why Choose Us","is_visible":true,"order":6},{"id":"cta","label":"Call to Action","is_visible":true,"order":7}]'),

  -- Footer Config (JSON)
  ('footer_config', '{"description":"Professional corporate training that transforms people and organisations.","contact_email":"info@enkaprime.com","contact_phone":"0200 769 146","linkedin_url":"https://linkedin.com/company/enkaprime","copyright_text":"© 2026 Enka Prime Consulting Ltd. All rights reserved.","tagline":"Empowering People. Enhancing Performance. Delivering Excellence."}'),

  -- Social Links
  ('facebook_url', 'https://facebook.com/enkaprime'),
  ('whatsapp_url', 'https://wa.me/233200769146'),

  -- Structured lists for UI (JSON arrays)
  ('service_pillars', '["Records Digitalisation & Document Management","Asset Tagging & Registers","ISO Implementation & Compliance Support","Training & Capacity Building"]'),
  ('target_industries', '["SMEs & Growing Businesses","Financial & Professional Services","Energy, Construction & Operations","Public Sector & NGOs","Manufacturing & Hospitality","Technology & Telecommunications"]'),

  -- Course Modules (empty array default)
  ('course_modules', '[]')

ON CONFLICT (key) DO NOTHING;
