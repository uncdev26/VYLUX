import { pgSchema, uuid, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';

export const cms = pgSchema('cms');

export const designTokens = cms.table('design_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // color, typography, spacing, shadow, border, breakpoint
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const designComponents = cms.table('design_components', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // atom, molecule, organism, template
  schema: jsonb('schema').default({}).notNull(),
  styles: jsonb('styles').default({}).notNull(),
  props: jsonb('props').default({}).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const designThemes = cms.table('design_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  tokens: jsonb('tokens').default({}).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
