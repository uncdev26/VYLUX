import { pgSchema, uuid, text, jsonb, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const cms = pgSchema('cms');

export const headerConfigs = cms.table('header_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  logoMediaId: uuid('logo_media_id'),
  config: jsonb('config').default({}).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const footerConfigs = cms.table('footer_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  config: jsonb('config').default({}).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  parent: one(menuItems, {
    fields: [menuItems.parentId],
    references: [menuItems.id],
  }),
  children: many(menuItems),
}));
