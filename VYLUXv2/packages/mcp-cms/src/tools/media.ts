import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@vylux/database';
import { media, mediaFolders } from '@vylux/database';
import { whereNotDeleted } from '@vylux/database';

export function registerMediaTools(server: McpServer) {
  server.tool('list_media', 'List media files', {
    folder_id: z.string().uuid().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }, async ({ folder_id, limit, offset }) => {
    try {
      const conditions = [whereNotDeleted(media)];
      if (folder_id) conditions.push(eq(media.folderId, folder_id));

      const rows = await db.select().from(media)
        .where(and(...conditions))
        .orderBy(desc(media.createdAt))
        .limit(limit).offset(offset);

      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('upload_media', 'Register a media file (upload the file to MinIO first, then call this)', {
    filename: z.string().min(1),
    mime_type: z.string().min(1),
    size: z.number().min(0),
    storage_path: z.string().min(1),
    alt_text: z.string().optional(),
    caption: z.string().optional(),
    folder_id: z.string().uuid().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }, async (values) => {
    try {
      const [row] = await db.insert(media).values({
        filename: values.filename,
        mimeType: values.mime_type,
        size: values.size,
        storagePath: values.storage_path,
        altText: values.alt_text,
        caption: values.caption,
        folderId: values.folder_id,
        width: values.width,
        height: values.height,
      }).returning();

      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: row }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('delete_media', 'Soft-delete a media file', {
    id: z.string().uuid(),
  }, async ({ id }) => {
    try {
      await db.update(media).set({ deletedAt: new Date() })
        .where(and(eq(media.id, id), whereNotDeleted(media)));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });

  server.tool('list_media_folders', 'List media folders', {
    parent_id: z.string().uuid().optional(),
  }, async ({ parent_id }) => {
    try {
      const conditions = [whereNotDeleted(mediaFolders)];
      if (parent_id) conditions.push(eq(mediaFolders.parentId, parent_id));

      const rows = await db.select().from(mediaFolders)
        .where(and(...conditions));
      return { content: [{ type: 'text', text: JSON.stringify({ success: true, data: rows }) }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: err.message }) }] };
    }
  });
}
