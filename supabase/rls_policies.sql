-- RLS Policies and Grants for VYLUX
-- Run this AFTER the Supabase database is fully initialized
-- (roles anon, authenticated, service_role must exist)
--
-- Usage: psql -f supabase/rls_policies.sql

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO anon, authenticated, service_role;

-- Enable RLS on all tables
ALTER TABLE design_tokens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_themes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE media            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemaps         ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE header_configs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_configs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- Service-role policies (full access for the backend API)
CREATE POLICY "service_all" ON design_tokens    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON design_components FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON design_themes    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON categories       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON tags             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON posts            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON posts_tags       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON pages            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON media_folders    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON media            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON seo_configs      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON sitemaps         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON redirects        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON forms            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON submissions      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON branding_assets  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON header_configs   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON footer_configs   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON menu_items       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON audit_logs       FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon read policies (for public API access)
CREATE POLICY "anon_read" ON design_tokens    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON design_components FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON design_themes    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON categories       FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON tags             FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON posts            FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON pages            FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON media            FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON seo_configs      FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON sitemaps         FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON redirects        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON forms            FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON branding_assets  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON header_configs   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON footer_configs   FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON menu_items       FOR SELECT TO anon USING (true);
