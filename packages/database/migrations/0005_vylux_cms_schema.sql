-- VYLUX CMS Schema Migration
-- Creates the 'cms' schema and all CMS tables alongside LobeHub's existing tables

-- Create the CMS schema
CREATE SCHEMA IF NOT EXISTS cms;

-- Extensions (may already exist in public schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUM types
CREATE TYPE cms.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE cms.form_status AS ENUM ('active', 'inactive', 'archived');

-- Shared trigger: auto-set updated_at on row update
CREATE OR REPLACE FUNCTION cms.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Design System tables
-- =============================================================================

CREATE TABLE cms.design_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_tokens_category ON cms.design_tokens(category);
CREATE INDEX idx_design_tokens_value ON cms.design_tokens USING GIN(value);

CREATE TABLE cms.design_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    schema JSONB NOT NULL DEFAULT '{}',
    styles JSONB NOT NULL DEFAULT '{}',
    props JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_design_components_category ON cms.design_components(category);

CREATE TABLE cms.design_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    tokens JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- Content tables
-- =============================================================================

CREATE TABLE cms.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES cms.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}',
    excerpt TEXT,
    status cms.content_status DEFAULT 'draft',
    author_id UUID,
    category_id UUID REFERENCES cms.categories(id),
    featured_image UUID,
    seo JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_posts_slug ON cms.posts(slug);
CREATE INDEX idx_posts_status ON cms.posts(status);
CREATE INDEX idx_posts_category ON cms.posts(category_id);
CREATE INDEX idx_posts_published_at ON cms.posts(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_content ON cms.posts USING GIN(content);
CREATE INDEX idx_posts_seo ON cms.posts USING GIN(seo);

CREATE TABLE cms.posts_tags (
    post_id UUID REFERENCES cms.posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES cms.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE cms.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL DEFAULT '{}',
    status cms.content_status DEFAULT 'draft',
    template TEXT,
    seo JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pages_slug ON cms.pages(slug);
CREATE INDEX idx_pages_status ON cms.pages(status);

-- =============================================================================
-- Media tables
-- =============================================================================

CREATE TABLE cms.media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES cms.media_folders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL CHECK (size >= 0),
    width INTEGER,
    height INTEGER,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    folder_id UUID REFERENCES cms.media_folders(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_media_folder ON cms.media(folder_id);

-- =============================================================================
-- SEO tables
-- =============================================================================

CREATE TABLE cms.seo_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL,
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

CREATE INDEX idx_seo_configs_page ON cms.seo_configs(page_type, page_id);

CREATE TABLE cms.sitemaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL UNIQUE,
    last_modified TIMESTAMP WITH TIME ZONE,
    change_frequency TEXT,
    priority DECIMAL(2,1) CHECK (priority >= 0.0 AND priority <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.redirects (
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

CREATE TABLE cms.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    fields JSONB NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    status cms.form_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_forms_slug ON cms.forms(slug);

CREATE TABLE cms.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES cms.forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_submissions_form ON cms.submissions(form_id);

-- =============================================================================
-- Branding tables
-- =============================================================================

CREATE TABLE cms.branding_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    media_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_branding_assets_type ON cms.branding_assets(type);

-- =============================================================================
-- Navigation tables
-- =============================================================================

CREATE TABLE cms.header_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_media_id UUID,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.footer_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cms.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_type TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT,
    page_id UUID,
    parent_id UUID REFERENCES cms.menu_items(id),
    sort_order INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CHECK (url IS NOT NULL OR page_id IS NOT NULL)
);

CREATE INDEX idx_menu_items_type ON cms.menu_items(menu_type);
CREATE INDEX idx_menu_items_parent ON cms.menu_items(parent_id);

-- =============================================================================
-- Audit log
-- =============================================================================

CREATE TABLE cms.audit_logs (
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

CREATE INDEX idx_audit_logs_user ON cms.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON cms.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON cms.audit_logs(created_at);

-- =============================================================================
-- updated_at triggers (all tables except audit_logs, which are immutable)
-- =============================================================================

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.design_tokens    FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.design_components FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.design_themes    FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.categories       FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.tags             FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.posts            FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.pages            FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.media_folders    FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.media            FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.seo_configs      FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.sitemaps         FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.redirects        FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.forms            FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.submissions      FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.branding_assets  FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.header_configs   FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.footer_configs   FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON cms.menu_items       FOR EACH ROW EXECUTE FUNCTION cms.update_updated_at();
