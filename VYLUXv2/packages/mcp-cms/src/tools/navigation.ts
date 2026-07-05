import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@vylux/database';
import { headerConfigs, footerConfigs, menuItems } from '@vylux/database';
import { whereNotDeleted } from '@vylux/database';

export function registerNavigationTools(server: McpServer) {
  server.tool('get_header_config', 'Get active header config', {}, async () => {
    try {
      const [row] = await db.select().from(headerConfigs)
        .where(and(eq(headerConfigs.isActive, true), whereNotDeleted(headerConfigs)))
        .limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_header_config', 'Update header config', {
    id: z.string().uuid(),
    config: z.record(z.any()).optional(),
    logo_media_id: z.string().uuid().optional(),
  }, async ({ id, config, logo_media_id }) => {
    try {
      const values: Record<string, any> = {};
      if (config) values.config = config;
      if (logo_media_id) values.logoMediaId = logo_media_id;
      const [row] = await db.update(headerConfigs).set(values)
        .where(and(eq(headerConfigs.id, id), whereNotDeleted(headerConfigs)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Header config not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('get_footer_config', 'Get active footer config', {}, async () => {
    try {
      const [row] = await db.select().from(footerConfigs)
        .where(and(eq(footerConfigs.isActive, true), whereNotDeleted(footerConfigs)))
        .limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_footer_config', 'Update footer config', {
    id: z.string().uuid(),
    config: z.record(z.any()),
  }, async ({ id, config }) => {
    try {
      const [row] = await db.update(footerConfigs).set({ config })
        .where(and(eq(footerConfigs.id, id), whereNotDeleted(footerConfigs)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Footer config not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('list_menu_items', 'List menu items by type', {
    menu_type: z.enum(['header', 'footer', 'sidebar']),
  }, async ({ menu_type }) => {
    try {
      const rows = await db.select().from(menuItems)
        .where(and(eq(menuItems.menuType, menu_type), whereNotDeleted(menuItems)))
        .orderBy(menuItems.sortOrder);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_menu_item', 'Update a menu item', {
    id: z.string().uuid(),
    label: z.string().optional(),
    url: z.string().optional(),
    sort_order: z.number().optional(),
  }, async ({ id, ...updates }) => {
    try {
      const values: Record<string, any> = {};
      if (updates.label) values.label = updates.label;
      if (updates.url) values.url = updates.url;
      if (updates.sort_order !== undefined) values.sortOrder = updates.sort_order;
      const [row] = await db.update(menuItems).set(values)
        .where(and(eq(menuItems.id, id), whereNotDeleted(menuItems)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Menu item not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
