import { pgSchema, uuid, text, jsonb, timestamp, pgEnum, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const cms = pgSchema('cms');

export const formStatusEnum = cms.enum('form_status', ['active', 'inactive', 'archived']);

export const forms = cms.table('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  fields: jsonb('fields').default([]).notNull(),
  settings: jsonb('settings').default({}),
  status: formStatusEnum('status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const submissions = cms.table('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull(),
  data: jsonb('data').default({}).notNull(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const formsRelations = relations(forms, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  form: one(forms, {
    fields: [submissions.formId],
    references: [forms.id],
  }),
}));
