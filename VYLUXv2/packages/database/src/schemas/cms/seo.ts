import { pgSchema, uuid, text, jsonb, timestamp, decimal, boolean, integer } from 'drizzle-orm/pg-core';

export const cms = pgSchema('cms');

export const seoConfigs = cms.table('seo_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageType: text('page_type').notNull(), // home, post, page, category, custom
  pageId: uuid('page_id'),
  title: text('title'),
  description: text('description'),
  keywords: text('keywords').array(),
  ogImage: uuid('og_image'),
  structuredData: jsonb('structured_data').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const sitemaps = cms.table('sitemaps', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull().unique(),
  lastModified: timestamp('last_modified', { withTimezone: true }),
  changeFrequency: text('change_frequency'),
  priority: decimal('priority', { precision: 2, scale: 1 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const redirects = cms.table('redirects', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull(),
  statusCode: integer('status_code').default(301),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
