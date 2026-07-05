import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Media, FileUpload, UploadMediaInput, UpdateMediaInput } from '@newlight/shared';
import type { PaginationParams, PaginatedResult } from './content';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
]);

export class MediaService {
  private supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url) {
      throw new Error('Missing required environment variable: SUPABASE_URL');
    }
    if (!key) {
      throw new Error('Missing required environment variable: SUPABASE_ANON_KEY');
    }

    this.supabase = createClient(url, key);
  }

  async upload(file: FileUpload, options: UploadMediaInput = {}): Promise<Media> {
    if (file.buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    const id = uuidv4();
    const ext = file.originalname.split('.').pop();
    const filename = `${id}.${ext}`;
    const storagePath = `media/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('assets')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    // Save to database
    const { data, error } = await this.supabase
      .from('media')
      .insert({
        id,
        filename: file.originalname,
        storage_path: storagePath,
        mime_type: file.mimetype,
        size: file.buffer.length,
        width: options.width ?? null,
        height: options.height ?? null,
        alt_text: options.alt_text ?? null,
        caption: options.caption ?? null,
        metadata: options.metadata ?? null,
        folder_id: options.folder_id ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id: string): Promise<Media | null> {
    const { data, error } = await this.supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async list(
    filters?: { folder_id?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Media>> {
    const limit = Math.min(pagination?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = pagination?.offset ?? 0;

    let query = this.supabase
      .from('media')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.folder_id) {
      query = query.eq('folder_id', filters.folder_id);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], total: count ?? 0 };
  }

  async update(id: string, input: UpdateMediaInput): Promise<Media> {
    const { data, error } = await this.supabase
      .from('media')
      .update(input)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  }
}
