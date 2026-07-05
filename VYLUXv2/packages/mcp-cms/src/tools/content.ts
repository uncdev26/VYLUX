import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@vylux/database';
import { posts, pages, categories, tags, postsTags } from '@vylux/database';
import { generateSlug, whereNotDeleted } from '@vylux/database';

export function registerContentTools(server: McpServer) {
  // --- Posts ---

  server.tool('list_posts', 'List blog posts with optional filters', {
    status: z.enum(['draft', 'published', 'archived']).optional(),
    category_id: z.string().uuid().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }, async ({ status, category_id, limit, offset }) => {
    try {
      const conditions = [whereNotDeleted(posts)];
      if (status) conditions.push(eq(posts.status, status));
      if (category_id) conditions.push(eq(posts.categoryId, category_id));

      const rows = await db.select()
        .from(posts)
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('get_post', 'Get a single post by ID or slug', {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
  }, async ({ id, slug }) => {
    try {
      if (!id && !slug) {
        return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Provide id or slug' }) }] };
      }
      const condition = id ? eq(posts.id, id) : eq(posts.slug, slug!);
      const [row] = await db.select().from(posts).where(and(condition, whereNotDeleted(posts))).limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('create_post', 'Create a new blog post', {
    title: z.string().min(1),
    content: z.record(z.any()).default({}),
    excerpt: z.string().optional(),
    category_id: z.string().uuid().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    seo: z.record(z.any()).optional(),
  }, async ({ title, content, excerpt, category_id, status, seo }) => {
    try {
      const slug = generateSlug(title);
      const [row] = await db.insert(posts).values({
        title, slug, content, excerpt, categoryId: category_id, status, seo: seo ?? {},
        publishedAt: status === 'published' ? new Date() : undefined,
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_post', 'Update an existing post', {
    id: z.string().uuid(),
    title: z.string().optional(),
    content: z.record(z.any()).optional(),
    excerpt: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    seo: z.record(z.any()).optional(),
  }, async ({ id, ...updates }) => {
    try {
      const values: Record<string, any> = {};
      if (updates.title) values.title = updates.title;
      if (updates.content) values.content = updates.content;
      if (updates.excerpt !== undefined) values.excerpt = updates.excerpt;
      if (updates.status) {
        values.status = updates.status;
        if (updates.status === 'published') values.publishedAt = new Date();
      }
      if (updates.seo) values.seo = updates.seo;

      const [row] = await db.update(posts).set(values)
        .where(and(eq(posts.id, id), whereNotDeleted(posts)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Post not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('delete_post', 'Soft-delete a post', {
    id: z.string().uuid(),
  }, async ({ id }) => {
    try {
      await db.update(posts).set({ deletedAt: new Date() })
        .where(and(eq(posts.id, id), whereNotDeleted(posts)));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('publish_post', 'Publish a draft post', {
    id: z.string().uuid(),
  }, async ({ id }) => {
    try {
      const [row] = await db.update(posts).set({
        status: 'published',
        publishedAt: new Date(),
      }).where(and(eq(posts.id, id), whereNotDeleted(posts))).returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Post not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  // --- Pages ---

  server.tool('list_pages', 'List pages', {
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }, async ({ limit, offset }) => {
    try {
      const rows = await db.select().from(pages)
        .where(whereNotDeleted(pages))
        .orderBy(desc(pages.createdAt))
        .limit(limit).offset(offset);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('get_page', 'Get a page by ID or slug', {
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
  }, async ({ id, slug }) => {
    try {
      if (!id && !slug) {
        return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Provide id or slug' }) }] };
      }
      const condition = id ? eq(pages.id, id) : eq(pages.slug, slug!);
      const [row] = await db.select().from(pages).where(and(condition, whereNotDeleted(pages))).limit(1);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row ?? null }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('create_page', 'Create a new page', {
    title: z.string().min(1),
    content: z.record(z.any()).default({}),
    slug: z.string().optional(),
    template: z.string().optional(),
    seo: z.record(z.any()).optional(),
  }, async ({ title, content, slug, template, seo }) => {
    try {
      const finalSlug = slug ?? generateSlug(title);
      const [row] = await db.insert(pages).values({
        title, slug: finalSlug, content, template, seo: seo ?? {},
      }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('update_page', 'Update an existing page', {
    id: z.string().uuid(),
    title: z.string().optional(),
    content: z.record(z.any()).optional(),
    seo: z.record(z.any()).optional(),
  }, async ({ id, ...updates }) => {
    try {
      const values: Record<string, any> = {};
      if (updates.title) values.title = updates.title;
      if (updates.content) values.content = updates.content;
      if (updates.seo) values.seo = updates.seo;
      const [row] = await db.update(pages).set(values)
        .where(and(eq(pages.id, id), whereNotDeleted(pages)))
        .returning();
      if (!row) return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Page not found or deleted' }) }] };
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('delete_page', 'Soft-delete a page', {
    id: z.string().uuid(),
  }, async ({ id }) => {
    try {
      await db.update(pages).set({ deletedAt: new Date() })
        .where(and(eq(pages.id, id), whereNotDeleted(pages)));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  // --- Categories ---

  server.tool('list_categories', 'List all categories', {
    limit: z.number().min(1).max(100).default(50),
  }, async ({ limit }) => {
    try {
      const rows = await db.select().from(categories)
        .where(whereNotDeleted(categories))
        .limit(limit);
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('create_category', 'Create a new category', {
    name: z.string().min(1),
    description: z.string().optional(),
  }, async ({ name, description }) => {
    try {
      const slug = generateSlug(name);
      const [row] = await db.insert(categories).values({ name, slug, description }).returning();
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
