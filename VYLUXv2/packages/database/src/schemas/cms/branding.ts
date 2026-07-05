import { pgSchema, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const cms = pgSchema('cms');

export const brandingAssets = cms.table('branding_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // logo, favicon, og_image, watermark
  mediaId: uuid('media_id'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
