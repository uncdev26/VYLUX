import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { designTokens, designThemes } from '@lobechat/database/schemas/cms';
import { db } from '../db';
import { whereNotDeleted } from '../utils';

export function registerDesignTools(server: McpServer) {
  server.tool('list_design_tokens', 'List all design tokens', {
    category: z.string().optional(),
  }, async ({ category }) => {
    try {
      const conditions = [whereNotDeleted(designTokens)];
      if (category) conditions.push(eq(designTokens.category, category));

      const rows = await db.select().from(designTokens).where(and(...conditions));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('get_design_token', 'Get a design token by name', {
    name: z.string().min(1),
  }, async ({ name }) => {
    try {
      const [row] = await db.select().from(designTokens)
        .where(and(eq(designTokens.name, name), whereNotDeleted(designTokens)))
        .limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_design_token', 'Update or create a design token', {
    name: z.string().min(1),
    category: z.string().min(1),
    value: z.record(z.any()),
    description: z.string().optional(),
  }, async ({ name, category, value, description }) => {
    try {
      const [existing] = await db.select().from(designTokens)
        .where(and(eq(designTokens.name, name), whereNotDeleted(designTokens)))
        .limit(1);

      if (existing) {
        const [row] = await db.update(designTokens)
          .set({ value, description })
          .where(eq(designTokens.id, existing.id))
          .returning();
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
      }

      const [row] = await db.insert(designTokens).values({
        name, category, value, description,
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('list_design_themes', 'List all themes', {}, async () => {
    try {
      const rows = await db.select().from(designThemes)
        .where(whereNotDeleted(designThemes));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('apply_theme', 'Apply a theme (set all tokens from theme)', {
    theme_id: z.string().uuid(),
  }, async ({ theme_id }) => {
    try {
      const [theme] = await db.select().from(designThemes)
        .where(and(eq(designThemes.id, theme_id), whereNotDeleted(designThemes)))
        .limit(1);

      if (!theme) {
        return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Theme not found' }) }] };
      }

      await db.update(designThemes).set({ isDefault: false }).where(sql`${designThemes.isDefault} = true`);
      await db.update(designThemes).set({ isDefault: true }).where(eq(designThemes.id, theme_id));

      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: theme }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
