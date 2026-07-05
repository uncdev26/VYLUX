-- Newlight initial schema
-- Requires: PostgreSQL 15+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUM types
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE form_status AS ENUM ('active', 'inactive', 'archived');

-- =============================================================================
-- Shared trigger: auto-set updated_at on row update
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Design System tables
-- =============================================================================

CREATE TABLE design_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- color, typography, spacing, shadow, border, breakpoint
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_tokens_category ON design_tokens(category);
CREATE INDEX idx_design_tokens_value ON design_tokens USING GIN(value);

CREATE TABLE design_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- atom, molecule, organism, template
    schema JSONB NOT NULL DEFAULT '{}',
    styles JSONB NOT NULL DEFAULT '{}',
    props JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_components_category ON design_components(category);
CREATE INDEX idx_design_components_schema ON design_components USING GIN(schema);
CREATE INDEX idx_design_components_styles ON design_components USING GIN(styles);

CREATE TABLE design_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    tokens JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_themes_tokens ON design_themes USING GIN(tokens);

-- =============================================================================
-- Content tables
-- =============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}',
    excerpt TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID,          -- intentionally no FK: auth.users cannot be referenced in Supabase
    category_id UUID REFERENCES categories(id),
    featured_image UUID,     -- intentionally no FK: points to media(id) but avoids circular dependency risk
    seo JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_content ON posts USING GIN(content);
CREATE INDEX idx_posts_seo ON posts USING GIN(seo);
CREATE INDEX idx_posts_metadata ON posts USING GIN(metadata);

CREATE TABLE posts_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}',
    status content_status DEFAULT 'draft',
    template TEXT,
    seo JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_content ON pages USING GIN(content);
CREATE INDEX idx_pages_seo ON pages USING GIN(seo);

-- =============================================================================
-- Media tables
-- =============================================================================

CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES media_folders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL CHECK (size >= 0),
    width INTEGER,
    height INTEGER,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    folder_id UUID REFERENCES media_folders(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_media_folder ON media(folder_id);
CREATE INDEX idx_media_metadata ON media USING GIN(metadata);

-- =============================================================================
-- SEO tables
-- =============================================================================

CREATE TABLE seo_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL, -- home, post, page, category, custom
    page_id UUID,
    title TEXT,
    description TEXT,
    keywords TEXT[],
    og_image UUID,
    structured_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_seo_configs_page ON seo_configs(page_type, page_id);
CREATE INDEX idx_seo_configs_structured_data ON seo_configs USING GIN(structured_data);

CREATE TABLE sitemaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL UNIQUE,
    last_modified TIMESTAMP WITH TIME ZONE,
    change_frequency TEXT,
    priority DECIMAL(2,1) CHECK (priority >= 0.0 AND priority <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_path TEXT NOT NULL UNIQUE,
    to_path TEXT NOT NULL,
    status_code INTEGER DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- Forms tables
-- =============================================================================

CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    fields JSONB NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    status form_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_fields ON forms USING GIN(fields);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_submissions_form ON submissions(form_id);
CREATE INDEX idx_submissions_data ON submissions USING GIN(data);

-- =============================================================================
-- Branding tables
-- =============================================================================

CREATE TABLE branding_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- logo, favicon, og_image, watermark
    media_id UUID REFERENCES media(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_branding_assets_type ON branding_assets(type);
CREATE INDEX idx_branding_assets_media ON branding_assets(media_id);

-- =============================================================================
-- Navigation tables
-- =============================================================================

CREATE TABLE header_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_media_id UUID REFERENCES media(id),
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_header_configs_config ON header_configs USING GIN(config);

CREATE TABLE footer_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_footer_configs_config ON footer_configs USING GIN(config);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_type TEXT NOT NULL, -- header, footer, sidebar
    label TEXT NOT NULL,
    url TEXT,
    page_id UUID REFERENCES pages(id),
    parent_id UUID REFERENCES menu_items(id),
    sort_order INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CHECK (url IS NOT NULL OR page_id IS NOT NULL)
);

CREATE INDEX idx_menu_items_type ON menu_items(menu_type);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_page ON menu_items(page_id);
CREATE INDEX idx_menu_items_config ON menu_items USING GIN(config);

-- =============================================================================
-- Audit log
-- =============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================================================
-- updated_at triggers (all tables except audit_logs, which are immutable)
-- =============================================================================

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON design_tokens    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON design_components FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON design_themes    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON categories       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tags             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON posts            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON pages            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON media_folders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON media            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON seo_configs      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON sitemaps         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON redirects        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON forms            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON submissions      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON branding_assets  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON header_configs   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON footer_configs   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON menu_items       FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Row Level Security
-- All tables locked down; the service_role key bypasses RLS automatically,
-- so only the service_role (used by the Next.js API) can read/write.
-- =============================================================================

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
-- service_role bypasses RLS in Supabase, so these are fallback policies
-- for any role that does authenticate against PostgREST.

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
