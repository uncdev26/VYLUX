import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { seoConfigs, sitemaps, redirects } from '@lobechat/database/schemas/cms';
import { db } from '../db';
import { whereNotDeleted } from '../utils';

export function registerSeoTools(server: McpServer) {
  server.tool('get_seo_config', 'Get SEO config for a page', {
    page_type: z.string(),
    page_id: z.string().uuid(),
  }, async ({ page_type, page_id }) => {
    try {
      const [row] = await db.select().from(seoConfigs)
        .where(and(
          eq(seoConfigs.pageType, page_type),
          eq(seoConfigs.pageId, page_id),
          whereNotDeleted(seoConfigs),
        ))
        .limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_seo_config', 'Create or update SEO config', {
    page_type: z.string(),
    page_id: z.string().uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }, async ({ page_type, page_id, ...updates }) => {
    try {
      const [existing] = await db.select().from(seoConfigs)
        .where(and(eq(seoConfigs.pageType, page_type), eq(seoConfigs.pageId, page_id), whereNotDeleted(seoConfigs)))
        .limit(1);

      if (existing) {
        const [row] = await db.update(seoConfigs).set(updates).where(eq(seoConfigs.id, existing.id)).returning();
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
      }

      const [row] = await db.insert(seoConfigs).values({
        pageType: page_type, pageId: page_id, ...updates,
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('list_redirects', 'List URL redirects', {}, async () => {
    try {
      const rows = await db.select().from(redirects)
        .where(and(whereNotDeleted(redirects), eq(redirects.isActive, true)));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('create_redirect', 'Create a URL redirect', {
    from_path: z.string().min(1),
    to_path: z.string().min(1),
    status_code: z.number().refine(v => [301, 302, 307, 308].includes(v)).default(301),
  }, async ({ from_path, to_path, status_code }) => {
    try {
      const [row] = await db.insert(redirects).values({
        fromPath: from_path, toPath: to_path, statusCode: status_code,
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('generate_sitemap', 'Generate XML sitemap from published content', {}, async () => {
    try {
      const pages_data = await db.select({ url: sitemaps.url, lastModified: sitemaps.lastModified, priority: sitemaps.priority })
        .from(sitemaps).where(whereNotDeleted(sitemaps));

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages_data.map(p => `  <url>
    <loc>${p.url}</loc>
    ${p.lastModified ? `<lastmod>${p.lastModified.toISOString()}</lastmod>` : ''}
    ${p.priority ? `<priority>${p.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: xml }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
