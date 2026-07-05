import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { forms, submissions } from '@lobechat/database/schemas/cms';
import { db } from '../db';
import { generateSlug, whereNotDeleted } from '../utils';

export function registerFormsTools(server: McpServer) {
  server.tool('list_forms', 'List all forms', {}, async () => {
    try {
      const rows = await db.select().from(forms)
        .where(whereNotDeleted(forms))
        .orderBy(desc(forms.createdAt));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('get_form', 'Get form by ID or slug', {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
  }, async ({ id, slug }) => {
    try {
      if (!id && !slug) {
        return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Provide id or slug' }) }] };
      }
      const condition = id ? eq(forms.id, id) : eq(forms.slug, slug!);
      const [row] = await db.select().from(forms).where(and(condition, whereNotDeleted(forms))).limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('create_form', 'Create a new form', {
    name: z.string().min(1),
    fields: z.array(z.record(z.any())),
    settings: z.record(z.any()).optional(),
  }, async ({ name, fields, settings }) => {
    try {
      const slug = generateSlug(name);
      const [row] = await db.insert(forms).values({
        name, slug, fields, settings: settings ?? {},
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_form', 'Update an existing form', {
    id: z.string().uuid(),
    name: z.string().optional(),
    fields: z.array(z.record(z.any())).optional(),
    settings: z.record(z.any()).optional(),
  }, async ({ id, ...updates }) => {
    try {
      const [row] = await db.update(forms).set(updates)
        .where(and(eq(forms.id, id), whereNotDeleted(forms)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Form not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('list_submissions', 'List submissions for a form', {
    form_id: z.string().uuid(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }, async ({ form_id, limit, offset }) => {
    try {
      const rows = await db.select().from(submissions)
        .where(and(eq(submissions.formId, form_id), whereNotDeleted(submissions)))
        .orderBy(desc(submissions.createdAt))
        .limit(limit).offset(offset);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
