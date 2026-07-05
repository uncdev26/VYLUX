// Utility helpers for MCP CMS tools
import { sql, type SQL, type AnyColumn } from 'drizzle-orm';

/**
 * Generate a URL-safe slug from a title.
 * Appends a 4-char random suffix to avoid collisions.
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Returns a SQL condition that filters out soft-deleted rows.
 * Usage: .where(and(eq(table.id, id), whereNotDeleted(table)))
 */
export function whereNotDeleted(table: { deletedAt: AnyColumn }): SQL {
  return sql`${table.deletedAt} IS NULL`;
}
