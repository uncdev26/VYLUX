// VYLUX CMS Schema — content management tables
// These live in the 'cms' PostgreSQL schema, separate from LobeHub's 'public' schema.
// Uses pgSchema('cms') for complete namespace isolation.

import { pgSchema, uuid, text, jsonb, timestamp, boolean, integer, decimal, primaryKey, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const cms = pgSchema('cms');

// =============================================================================
// Shared helpers
// =============================================================================

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => timestamptz('created_at').defaultNow();
const updatedAt = () => timestamptz('updated_at').defaultNow().$onUpdate(() => new Date());
const deletedAt = () => timestamptz('deleted_at');

// =============================================================================
// Enums
// =============================================================================

export const contentStatusEnum = cms.enum('content_status', ['draft', 'published', 'archived']);
export const formStatusEnum = cms.enum('form_status', ['active', 'inactive', 'archived']);

// =============================================================================
// Design System
// =============================================================================

export const designTokens = cms.table('design_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // color, typography, spacing, shadow, border, breakpoint
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const designComponents = cms.table('design_components', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // atom, molecule, organism, template
  schema: jsonb('schema').default({}).notNull(),
  styles: jsonb('styles').default({}).notNull(),
  props: jsonb('props').default({}).notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const designThemes = cms.table('design_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  tokens: jsonb('tokens').default({}).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Content
// =============================================================================

export const categories = cms.table('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const tags = cms.table('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const posts = cms.table('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content').default({}).notNull(),
  excerpt: text('excerpt'),
  status: contentStatusEnum('status').default('draft'),
  authorId: uuid('author_id'), // no FK — references public.users by UUID in app layer
  categoryId: uuid('category_id'),
  featuredImage: uuid('featured_image'), // no FK — references media(id) in app layer
  seo: jsonb('seo').default({}),
  metadata: jsonb('metadata').default({}),
  publishedAt: timestamptz('published_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const postsTags = cms.table('posts_tags', {
  postId: uuid('post_id').notNull(),
  tagId: uuid('tag_id').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.tagId] }),
}));

export const pages = cms.table('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content').default({}).notNull(),
  status: contentStatusEnum('status').default('draft'),
  template: text('template'),
  seo: jsonb('seo').default({}),
  metadata: jsonb('metadata').default({}),
  publishedAt: timestamptz('published_at'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Media
// =============================================================================

export const mediaFolders = cms.table('media_folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const media = cms.table('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  storagePath: text('storage_path').notNull(),
  altText: text('alt_text'),
  caption: text('caption'),
  folderId: uuid('folder_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// SEO
// =============================================================================

export const seoConfigs = cms.table('seo_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageType: text('page_type').notNull(), // home, post, page, category, custom
  pageId: uuid('page_id'),
  title: text('title'),
  description: text('description'),
  keywords: text('keywords').array(),
  ogImage: uuid('og_image'),
  structuredData: jsonb('structured_data').default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const sitemaps = cms.table('sitemaps', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull().unique(),
  lastModified: timestamptz('last_modified'),
  changeFrequency: text('change_frequency'),
  priority: decimal('priority', { precision: 2, scale: 1 }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const redirects = cms.table('redirects', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').default(301),
  isActive: boolean('is_active').default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Forms
// =============================================================================

export const forms = cms.table('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  fields: jsonb('fields').default([]).notNull(),
  settings: jsonb('settings').default({}),
  status: formStatusEnum('status').default('active'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const submissions = cms.table('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull(),
  data: jsonb('data').default({}).notNull(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Branding
// =============================================================================

export const brandingAssets = cms.table('branding_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // logo, favicon, og_image, watermark
  mediaId: uuid('media_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Navigation
// =============================================================================

export const headerConfigs = cms.table('header_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logoMediaId: uuid('logo_media_id'),
  config: jsonb('config').default({}).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const footerConfigs = cms.table('footer_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  config: jsonb('config').default({}).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

export const menuItems = cms.table('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  menuType: text('menu_type').notNull(), // header, footer, sidebar
  label: text('label').notNull(),
  url: text('url'),
  pageId: uuid('page_id'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  config: jsonb('config').default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: deletedAt(),
});

// =============================================================================
// Audit
// =============================================================================

export const auditLogs = cms.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: inet('ip_address'),
  createdAt: createdAt(),
});

// =============================================================================
// Relations
// =============================================================================

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  tags: many(postsTags),
}));

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, { fields: [postsTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postsTags.tagId], references: [tags.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsTags),
}));

export const mediaFoldersRelations = relations(mediaFolders, ({ one, many }) => ({
  parent: one(mediaFolders, { fields: [mediaFolders.parentId], references: [mediaFolders.id] }),
  media: many(media),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  folder: one(mediaFolders, { fields: [media.folderId], references: [mediaFolders.id] }),
}));

export const formsRelations = relations(forms, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  form: one(forms, { fields: [submissions.formId], references: [forms.id] }),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  parent: one(menuItems, { fields: [menuItems.parentId], references: [menuItems.id] }),
  children: many(menuItems),
}));
