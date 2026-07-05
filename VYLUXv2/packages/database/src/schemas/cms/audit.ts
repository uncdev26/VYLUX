import { pgSchema, uuid, text, jsonb, timestamp, inet } from 'drizzle-orm/pg-core';

export const cms = pgSchema('cms');

export const auditLogs = cms.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
