# VYLUX v2 — Improved Architecture (Single-Database)

## Executive Summary

**Eliminate Supabase PostgreSQL entirely.** LobeHub's ParadeDB instance already provides PostgreSQL 17 with pgvector + pg_search. Add a `cms` schema alongside LobeHub's existing tables, build MCP tools that query via Drizzle ORM, and expose a thin read-only API for the Astro public site.

**Result:** One database instead of two. One MinIO instead of two. Zero PostgREST. Simpler ops, lower cost, fewer failure modes.

---

## Current vs. Proposed

```
CURRENT (Two Databases)                    PROPOSED (Single Database)
┌──────────────┐  ┌──────────────┐        ┌──────────────────────────────┐
│  LobeHub DB   │  │  Supabase DB  │        │  LobeHub DB (ParadeDB)       │
│  (ParadeDB)   │  │  (PostgreSQL) │        │                              │
│               │  │               │        │  Schema: public  (LobeHub)   │
│  Schema:      │  │  Schema:      │        │  Schema: cms     (VYLUX CMS) │
│  public       │  │  public       │        │                              │
│               │  │               │        │  pgvector + pg_search        │
│  Tables:      │  │  Tables:      │        │                              │
│  users, msgs, │  │  posts, pages,│        │  Tables:                     │
│  agents, etc. │  │  forms, media,│        │  [LobeHub tables]            │
│               │  │  seo, etc.    │        │  + posts, pages, forms,      │
└──────┬────────┘  └──────┬────────┘        │    media, seo, design, etc.  │
       │                  │                 └──────┬───────────────────────┘
       ▼                  ▼                        ▼
  ┌─────────┐      ┌───────────┐            ┌─────────┐
  │  MinIO   │      │   MinIO   │            │  MinIO   │
  │ (LobeHub)│      │  (VYLUX)  │            │ (shared) │
  └─────────┘      └───────────┘            └─────────┘

  2 PostgreSQL       2 MinIO                 1 PostgreSQL    1 MinIO
  + PostgREST                                + no PostgREST
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        VYLUX (LobeHub Fork)                          │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐│
│  │   Agents     │  │   Skills     │  │   MCP Tools (@vylux/cms)    ││
│  │             │  │              │  │                             ││
│  │ • Content   │─▶│ • blog-write │─▶│ • list_posts / create_post  ││
│  │ • Design    │  │ • seo-optim  │  │ • list_pages / create_page  ││
│  │ • SEO       │  │ • page-gen   │  │ • upload_media / list_media ││
│  │ • Forms     │  │ • form-build │  │ • get_seo / update_seo      ││
│  │ • Analytics │  │ • funnel     │  │ • list_forms / submit_form  ││
│  │ • Funnel    │  │ • research   │  │ • get_analytics / track_evt ││
│  └─────────────┘  └──────────────┘  └─────────────┬───────────────┘│
│                                                    │                │
│  ┌─────────────────────────────────────────────────┤                │
│  │              Model Gateway (MiMo)               │                │
│  │  endpoint: https://token-plan-sgp.xiaomimimo.com │                │
│  └─────────────────────────────────────────────────┘                │
│                                                    │                │
│  ┌─────────────────────────────────────────────────┐                │
│  │           IM Gateway (Telegram Bot)              │                │
│  └─────────────────────────────────────────────────┘                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              tRPC API Layer (LobeHub native)                    ││
│  │  + CMS Router (/trpc/cms.*) — read-only for Astro site         ││
│  └──────────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    ParadeDB (Single PostgreSQL 17)                    │
│                                                                      │
│  Schema: public           Schema: cms                                │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐   │
│  │ LobeHub tables:  │    │ VYLUX CMS tables:                   │   │
│  │  users           │    │  design_tokens, design_components,   │   │
│  │  agents          │    │  design_themes                       │   │
│  │  conversations   │    │  categories, tags, posts, posts_tags │   │
│  │  messages        │    │  pages                               │   │
│  │  plugins         │    │  media_folders, media                │   │
│  │  files           │    │  seo_configs, sitemaps, redirects    │   │
│  │  knowledge_bases │    │  forms, submissions                  │   │
│  │  ...             │    │  branding_assets                     │   │
│  └──────────────────┘    │  header_configs, footer_configs,     │   │
│                          │  menu_items                          │   │
│  pgvector + pg_search    │  audit_logs                          │   │
│  (shared extensions)     │  analytics_events, funnels           │   │
│                          └──────────────────────────────────────┘   │
│                                                                      │
│  Single connection pool, single backup, single point of truth        │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                          ┌───────┴───────┐
                          ▼               ▼
                   ┌─────────┐    ┌──────────────┐
                   │  MinIO  │    │ Redis (cache) │
                   │ (shared)│    └──────────────┘
                   └─────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│               Astro + Svelte (Public Website)                        │
│                                                                      │
│  Fetches data via:                                                   │
│  1. Build time: tRPC client → VYLUX API → cms schema                │
│  2. Runtime:    tRPC client → VYLUX API → cms schema                │
│  3. ISR/SSG:    On-demand revalidation via webhook                  │
│                                                                      │
│  Svelte 5 islands for: forms, funnels, chat widget                  │
│  Auto-generated: sitemaps, robots.txt, Schema.org markup            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Why This Works

### LobeHub's Database is Already PostgreSQL

LobeHub uses ParadeDB (PostgreSQL 17) with:
- **pgvector** — vector similarity search for RAG/knowledge base
- **pg_search** — full-text search via ParadeDB's BM25 index
- **Drizzle ORM** — type-safe schema definitions and migrations
- **Connection pooling** — built-in via pgBouncer or direct

Adding a `cms` schema is just adding more tables to the same instance. No new database, no new connection string, no new backup strategy.

### MCP Tools Can Use Drizzle Directly

The current plan has MCP tools calling PostgREST (HTTP) which calls PostgreSQL. That's an unnecessary hop. MCP tools running in the same Node.js process as LobeHub can import Drizzle directly:

```
Current:  MCP Tool → HTTP → PostgREST → PostgreSQL
Proposed: MCP Tool → Drizzle ORM → PostgreSQL (same connection pool)
```

This is faster, simpler, and gives us type safety.

### The Astro Site Needs a Read API Anyway

The Astro public site needs to fetch posts, pages, menus, etc. Currently it would call PostgREST. In the new architecture, we add a lightweight tRPC router to LobeHub that exposes read-only CMS queries. The Astro site calls this API.

Alternative: The MCP server can also run as a standalone HTTP server for the Astro site, but tRPC is cleaner since LobeHub already uses it.

---

## Implementation Details

### 1. Adding the `cms` Schema to Drizzle

LobeHub uses Drizzle ORM. We add CMS tables using `pgSchema()`:

```typescript
// packages/cms/db/schema.ts
import { pgSchema, uuid, text, timestamp, jsonb, integer, boolean, index, pgEnum } from 'drizzle-orm/pg-core';

// Create the cms schema namespace
export const cms = pgSchema('cms');

// Enums (schema-scoped)
export const contentStatus = cms.enum('content_status', ['draft', 'published', 'archived']);
export const formStatus = cms.enum('form_status', ['active', 'inactive', 'archived']);

// --- Design System ---
export const designTokens = cms.table('design_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category').notNull(), // color, typography, spacing, shadow, border, breakpoint
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('idx_design_tokens_category').on(table.category),
]);

export const designComponents = cms.table('design_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(),
  schema: jsonb('schema').default({}).notNull(),
  styles: jsonb('styles').default({}).notNull(),
  props: jsonb('props').default({}).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const designThemes = cms.table('design_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  tokens: jsonb('tokens').default({}).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Content ---
export const categories = cms.table('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const tags = cms.table('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const posts = cms.table('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content').default({}).notNull(),
  excerpt: text('excerpt'),
  status: contentStatus('status').default('draft'),
  authorId: uuid('author_id'), // references public.users.id (cross-schema FK)
  categoryId: uuid('category_id').references(() => categories.id),
  featuredImage: uuid('featured_image'),
  seo: jsonb('seo').default({}),
  metadata: jsonb('metadata').default({}),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('idx_posts_slug').on(table.slug),
  index('idx_posts_status').on(table.status),
  index('idx_posts_category').on(table.categoryId),
  index('idx_posts_published_at').on(table.publishedAt),
]);

export const postsTags = cms.table('posts_tags', {
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  // Composite PK handled via unique constraint
]);

export const pages = cms.table('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content').default({}).notNull(),
  status: contentStatus('status').default('draft'),
  template: text('template'),
  seo: jsonb('seo').default({}),
  metadata: jsonb('metadata').default({}),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Media ---
export const mediaFolders = cms.table('media_folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const media = cms.table('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  storagePath: text('storage_path').notNull(), // MinIO key
  altText: text('alt_text'),
  caption: text('caption'),
  folderId: uuid('folder_id').references(() => mediaFolders.id),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- SEO ---
export const seoConfigs = cms.table('seo_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageType: text('page_type').notNull(), // home, post, page, category, custom
  pageId: uuid('page_id'),
  title: text('title'),
  description: text('description'),
  keywords: text('keywords').array(),
  ogImage: uuid('og_image'),
  structuredData: jsonb('structured_data').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const redirects = cms.table('redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').default(301),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Forms ---
export const forms = cms.table('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  fields: jsonb('fields').default([]).notNull(),
  settings: jsonb('settings').default({}),
  status: formStatus('status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const submissions = cms.table('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }),
  data: jsonb('data').default({}).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Navigation ---
export const menuItems = cms.table('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuType: text('menu_type').notNull(), // header, footer, sidebar
  label: text('label').notNull(),
  url: text('url'),
  pageId: uuid('page_id').references(() => pages.id),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  config: jsonb('config').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Branding ---
export const brandingAssets = cms.table('branding_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // logo, favicon, og_image, watermark
  mediaId: uuid('media_id').references(() => media.id),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Analytics ---
export const analyticsEvents = cms.table('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventName: text('event_name').notNull(),
  pageType: text('page_type'),
  pageId: uuid('page_id'),
  properties: jsonb('properties').default({}),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Funnels ---
export const funnels = cms.table('funnels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  steps: jsonb('steps').default([]).notNull(),
  settings: jsonb('settings').default({}),
  status: text('status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// --- Audit ---
export const auditLogs = cms.table('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Type exports ---
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Media = typeof media.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
```

### 2. MCP Tools — Direct Drizzle Access

Instead of calling PostgREST over HTTP, MCP tools import Drizzle directly:

```typescript
// packages/cms/mcp/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { db } from '../db/index.js';
import { posts, pages, media, forms, seoConfigs } from '../db/schema.js';
import { eq, desc, isNull, sql } from 'drizzle-orm';

const server = new McpServer({
  name: 'vylux-cms',
  version: '1.0.0',
});

// --- Posts ---
server.tool('list_posts', 'List blog posts with optional filters', {
  status: { type: 'string', description: 'Filter by status: draft, published, archived' },
  limit: { type: 'number', description: 'Max results (default 20)' },
  offset: { type: 'number', description: 'Offset for pagination' },
}, async ({ status, limit = 20, offset = 0 }) => {
  const query = db.select()
    .from(posts)
    .where(isNull(posts.deletedAt))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  if (status) {
    query.where(eq(posts.status, status as any));
  }

  const results = await query;
  return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
});

server.tool('create_post', 'Create a new blog post', {
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  excerpt: { type: 'string' },
  status: { type: 'string' },
  categoryId: { type: 'string' },
  seo: { type: 'object' },
}, async ({ title, content, excerpt, status, categoryId, seo }) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const [post] = await db.insert(posts).values({
    title,
    slug,
    content: typeof content === 'string' ? { body: content } : content,
    excerpt,
    status: (status as any) || 'draft',
    categoryId,
    seo: seo || {},
  }).returning();

  return { content: [{ type: 'text', text: JSON.stringify(post, null, 2) }] };
});

server.tool('update_post', 'Update an existing post', {
  id: { type: 'string', required: true },
  title: { type: 'string' },
  content: { type: 'string' },
  status: { type: 'string' },
  seo: { type: 'object' },
}, async ({ id, ...updates }) => {
  const set: Record<string, any> = {};
  if (updates.title) set.title = updates.title;
  if (updates.content) set.content = { body: updates.content };
  if (updates.status) set.status = updates.status;
  if (updates.seo) set.seo = updates.seo;

  const [post] = await db.update(posts)
    .set(set)
    .where(eq(posts.id, id))
    .returning();

  return { content: [{ type: 'text', text: JSON.stringify(post, null, 2) }] };
});

// ... similar tools for pages, media, forms, seo, etc.

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Key difference from current plan:** No PostgREST, no HTTP calls, no JWT auth for internal tools. The MCP server uses the same PostgreSQL connection pool as LobeHub.

### 3. Database Connection — Shared Pool

```typescript
// packages/cms/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Use the SAME DATABASE_URL as LobeHub
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

The MCP server and LobeHub share the same `DATABASE_URL`. One connection pool, one database.

### 4. Schema Migration — Drizzle Kit

```typescript
// packages/cms/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['cms'], // Only manage the cms schema
  migrations: {
    prefix: 'timestamp', // 20240101120000_create_posts.sql
  },
});
```

Migration commands:
```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Or push directly during development
npx drizzle-kit push
```

### 5. Initial Schema Migration

The first migration creates the `cms` schema and all tables:

```sql
-- packages/cms/db/migrations/0000_initial_cms_schema.sql
CREATE SCHEMA IF NOT EXISTS "cms";

-- Extensions (if not already loaded by LobeHub)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "cms"."content_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "cms"."form_status" AS ENUM ('active', 'inactive', 'archived');

-- Tables (generated by Drizzle Kit from schema.ts)
-- ... all CREATE TABLE statements with cms. prefix ...
```

### 6. Astro Site — Data Fetching

The Astro site has three options, in order of preference:

#### Option A: tRPC Client (Recommended)

Add a read-only CMS router to LobeHub's existing tRPC setup:

```typescript
// src/server/routers/cms.ts (in LobeHub fork)
import { router, publicProcedure } from '../trpc';
import { db } from '@/packages/cms/db';
import { posts, pages, menuItems, seoConfigs } from '@/packages/cms/db/schema';
import { eq, desc, isNull, and } from 'drizzle-orm';

export const cmsRouter = router({
  getPublishedPosts: publicProcedure
    .query(async () => {
      return db.select()
        .from(posts)
        .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
        .orderBy(desc(posts.publishedAt));
    }),

  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [post] = await db.select()
        .from(posts)
        .where(and(eq(posts.slug, input.slug), isNull(posts.deletedAt)));
      return post;
    }),

  getPublishedPages: publicProcedure.query(async () => { /* ... */ }),
  getPageBySlug: publicProcedure.query(async ({ input }) => { /* ... */ }),
  getMenuItems: publicProcedure
    .input(z.object({ menuType: z.enum(['header', 'footer', 'sidebar']) }))
    .query(async ({ input }) => { /* ... */ }),
  getSeoConfig: publicProcedure
    .input(z.object({ pageType: z.string(), pageId: z.string().optional() }))
    .query(async ({ input }) => { /* ... */ }),
  getDesignTokens: publicProcedure.query(async () => { /* ... */ }),
  getBrandingAssets: publicProcedure.query(async () => { /* ... */ }),
});
```

Astro site uses a tRPC client:

```typescript
// astro-site/src/lib/cms.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@vylux/api';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VYLUX_API_URL}/trpc`,
    }),
  ],
});

// Usage in Astro pages
export async function getStaticPosts() {
  return trpc.cms.getPublishedPosts.query();
}
```

#### Option B: Direct Database Connection (Build-time only)

For static site generation, the Astro build can connect directly to PostgreSQL:

```typescript
// astro-site/src/lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as cmsSchema from '@vylux/cms/db/schema';

const pool = new Pool({ connectionString: import.meta.env.DATABASE_URL });
const db = drizzle(pool, { schema: cmsSchema });

// Only used during `astro build` — not at runtime
export async function getStaticPosts() {
  return db.query.posts.findMany({
    where: (posts, { eq, and, isNull }) =>
      and(eq(posts.status, 'published'), isNull(posts.deletedAt)),
    orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
  });
}
```

**Pros:** Zero network overhead at build time.
**Cons:** Requires DATABASE_URL in the build environment. Not suitable for runtime SSR.

#### Option C: MCP Server as HTTP API (Fallback)

Run the MCP server as a standalone HTTP server for the Astro site:

```typescript
// packages/cms/server.ts
import { createServer } from '@vylux/cms/mcp';
import express from 'express';

const app = express();

// Expose MCP tools as REST endpoints
app.get('/api/posts', async (req, res) => {
  const posts = await db.select().from(postsTable).where(isNull(postsTable.deletedAt));
  res.json(posts);
});

app.listen(3002);
```

**Use this only if tRPC integration is too complex.** The tRPC router (Option A) is preferred.

### 7. Docker Compose — Simplified

```yaml
# docker-compose.yml (simplified)
name: vylux

services:
  # VYLUX (LobeHub fork) — Main Application
  vylux:
    build: .
    ports:
      - "3210:3210"
    environment:
      - DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@vylux-db:5432/lobehub
      - REDIS_URL=redis://vylux-redis:6379
      - S3_ENDPOINT=http://minio:9000
      - S3_BUCKET=vylux
      - S3_ACCESS_KEY=admin
      - S3_SECRET_ACCESS_KEY=${MINIO_PASSWORD}
      # MiMo model configured in LobeHub UI (Settings → Model Provider)
    depends_on:
      vylux-db:
        condition: service_healthy
      vylux-redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: always

  # Single PostgreSQL instance (ParadeDB)
  vylux-db:
    image: paradedb/paradedb:latest-pg17
    environment:
      POSTGRES_DB: lobehub
      POSTGRES_PASSWORD: ${PG_PASSWORD}
    volumes:
      - vylux-db-data:/var/lib/postgresql/data
      - ./packages/cms/db/migrations:/docker-entrypoint-initdb.d  # Auto-run CMS migrations
    command: ["postgres", "-c", "shared_preload_libraries=pg_search,pg_cron"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  # Redis
  vylux-redis:
    image: redis:7-alpine
    command: redis-server --save 60 1000 --appendonly yes
    volumes:
      - vylux-redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # MinIO (shared by LobeHub + CMS)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  vylux-db-data:
  vylux-redis-data:
  minio-data:
```

**What's gone:**
- `supabase-db` container (PostgreSQL #2)
- `postgrest` container
- `supabase-data` volume
- `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PGRST_*` env vars

**What stays (4 containers instead of 6):**
- `vylux` (LobeHub fork)
- `vylux-db` (ParadeDB)
- `vylux-redis`
- `minio`

---

## File Structure

```
VYLUX/                              # LobeHub fork
├── src/                            # LobeHub core (minimal changes)
│   └── server/
│       └── routers/
│           └── cms.ts              # NEW: tRPC router for CMS read API
├── packages/
│   └── cms/                        # NEW: CMS package
│       ├── db/
│       │   ├── schema.ts           # Drizzle schema (cms schema tables)
│       │   ├── index.ts            # Database connection (shared pool)
│       │   ├── migrations/         # Drizzle Kit migrations
│       │   └── seeds/              # Seed data
│       ├── mcp/
│       │   ├── index.ts            # MCP server entry
│       │   └── tools/              # Tool implementations
│       │       ├── posts.ts
│       │       ├── pages.ts
│       │       ├── media.ts
│       │       ├── forms.ts
│       │       ├── seo.ts
│       │       ├── design.ts
│       │       └── analytics.ts
│       ├── drizzle.config.ts       # Drizzle Kit config
│       └── package.json
├── agents/                         # Pre-installed agents (unchanged)
├── skills/                         # Pre-installed skills (unchanged)
├── resources/                      # Knowledge base (unchanged)
├── docker-compose.yml              # SIMPLIFIED: 4 containers
├── .env.example                    # SIMPLIFIED: fewer vars
└── astro-site/                     # Public website (separate build)
    ├── src/
    │   ├── lib/
    │   │   └── cms.ts              # tRPC client for CMS data
    │   ├── pages/
    │   └── components/
    └── astro.config.mjs
```

---

## Migration Path from Current Plan

### Step 1: Remove Supabase Dependencies

1. Delete `supabase-db` from `docker-compose.yml`
2. Delete `postgrest` from `docker-compose.yml`
3. Delete `supabase/` directory
4. Remove `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `PGRST_*` from `.env`

### Step 2: Create CMS Package

1. Create `packages/cms/` directory
2. Port `docs/schema.sql` to `packages/cms/db/schema.ts` (Drizzle)
3. Create `packages/cms/db/index.ts` (shared connection)
4. Create `packages/cms/drizzle.config.ts`
5. Generate initial migration

### Step 3: Build MCP Tools

1. Create `packages/cms/mcp/index.ts`
2. Port all tools from `docs/MCP-SUPABASE-TOOLS.md`
3. Replace PostgREST HTTP calls with direct Drizzle queries
4. Register MCP server in LobeHub config

### Step 4: Add tRPC Router

1. Create `src/server/routers/cms.ts` in LobeHub fork
2. Register in LobeHub's tRPC router
3. Test with the Astro site

### Step 5: Update Astro Site

1. Replace Supabase client with tRPC client
2. Update data fetching in all pages
3. Test static generation and SSR

### Step 6: Update Agents

No changes needed. Agents still call MCP tools by name. The tools just connect differently.

---

## Advantages

| Aspect | Current Plan | Proposed |
|--------|-------------|----------|
| **PostgreSQL instances** | 2 (ParadeDB + Supabase) | 1 (ParadeDB) |
| **Containers** | 6 | 4 |
| **Memory usage** | ~2GB (two PG instances) | ~1GB (one PG instance) |
| **Backup strategy** | Two separate backups | One backup |
| **Connection management** | Two pools, two configs | One pool, one config |
| **Data consistency** | Cross-DB transactions impossible | Single DB, native transactions |
| **MCP tool latency** | HTTP hop to PostgREST | Direct Drizzle query |
| **Type safety** | PostgREST = untyped HTTP | Drizzle = full TypeScript |
| **Schema management** | Raw SQL migrations | Drizzle Kit (auto-generated) |
| **Env vars** | 10+ for Supabase | 0 (uses existing DATABASE_URL) |
| **Ops complexity** | High (two DBs, PostgREST, JWT) | Low (one DB, standard PG) |

---

## Risks & Mitigations

### Risk 1: Schema Collision
**Risk:** LobeHub and CMS tables could conflict.
**Mitigation:** The `cms` schema is a separate namespace. `cms.posts` and `public.users` cannot collide. Drizzle's `pgSchema()` enforces this at the ORM level.

### Risk 2: Migration Conflicts
**Risk:** LobeHub migrations and CMS migrations could interfere.
**Mitigation:** LobeHub manages `public` schema. CMS manages `cms` schema. They use separate Drizzle Kit configs with `schemaFilter`. No overlap.

### Risk 3: Connection Pool Contention
**Risk:** CMS queries compete with LobeHub for database connections.
**Mitigation:** PostgreSQL handles concurrent connections well. The default pool size (10) is sufficient for both workloads. If needed, increase `max_connections` or use pgBouncer.

### Risk 4: LobeHub Upgrade Breakage
**Risk:** Upstream LobeHub changes break CMS integration.
**Mitigation:** CMS is a separate package with no imports from LobeHub core. The only integration points are:
1. Shared `DATABASE_URL` env var
2. tRPC router registration (one import)
3. MCP server config (one JSON entry)

All are minimal surface area.

### Risk 5: ParadeDB Compatibility
**Risk:** ParadeDB extensions (pg_search, pg_cron) might conflict with CMS tables.
**Mitigation:** These extensions operate at the database level, not schema level. CMS tables with GIN indexes (JSONB) work fine alongside pg_search. No conflict expected.

### Risk 6: Cross-Schema Foreign Keys
**Risk:** `posts.author_id` references `public.users.id` — a cross-schema FK.
**Mitigation:** PostgreSQL supports cross-schema FKs natively. The reference is:
```typescript
authorId: uuid('author_id'), // No .references() — handle in application layer
```
We intentionally omit the FK constraint to avoid tight coupling. The MCP tools validate author existence before insert.

---

## Updated Phase Roadmap

### Phase 0: Fork & Configure (Day 1) — REVISED
- [ ] Fork LobeHub to `uncdev26/VYLUX`
- [ ] Configure MiMo as default model provider
- [ ] Create `packages/cms/` package with Drizzle schema
- [ ] Create Docker Compose (4 containers: LobeHub, ParadeDB, Redis, MinIO)
- [ ] Run initial migration to create `cms` schema
- [ ] Verify: LobeHub works, CMS tables exist in same DB

### Phase 1: MCP Bridge (Week 1) — REVISED
- [ ] Build `packages/cms/mcp/` MCP server (direct Drizzle, no PostgREST)
- [ ] Register MCP server in LobeHub config
- [ ] Verify: agent can CRUD posts via chat
- [ ] Add tRPC CMS router for Astro site

### Phase 2: Core Agents (Week 2-3) — UNCHANGED
- [ ] Create all 7 agent definitions
- [ ] Test each agent with MCP tools
- [ ] Refine system prompts

### Phase 3: Skills Library (Week 3-4) — UNCHANGED
- [ ] Create all 10+ skills
- [ ] Test end-to-end workflows
- [ ] Iterate on skill prompts

### Phase 4: Public Website (Week 4-5) — REVISED
- [ ] Astro site fetches via tRPC client (not Supabase client)
- [ ] Svelte 5 islands for interactive components
- [ ] Design system tokens from CMS
- [ ] SEO: auto-generated sitemaps, meta tags

### Phase 5: IM Gateway (Week 5-6) — UNCHANGED
- [ ] Telegram bot configuration
- [ ] Test CMS operations via Telegram

### Phase 6: Marketing Features (Week 6-10) — UNCHANGED
- [ ] Sales funnels, email automation, analytics, A/B testing

---

## Summary

**One database. One MinIO. Zero PostgREST. Four containers.**

The current plan runs two PostgreSQL instances because it treats Supabase as a separate service. But LobeHub already has PostgreSQL — we just need to add a `cms` schema to it. The MCP tools connect directly via Drizzle (no HTTP hop), and the Astro site fetches via a tRPC router that LobeHub already supports.

This is simpler, faster, cheaper, and easier to maintain.
