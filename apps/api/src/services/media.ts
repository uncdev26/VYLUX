import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Media, FileUpload, UploadMediaInput, UpdateMediaInput } from '@newlight/shared';

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
    const id = uuidv4();
    const ext = file.originalname.split('.').pop();
    const filename = `${id}.${ext}`;
    const path = `media/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('assets')
      .upload(path, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('assets')
      .getPublicUrl(path);

    // Save to database
    const { data, error } = await this.supabase
      .from('media')
      .insert({
        id,
        filename: file.originalname,
        url: urlData.publicUrl,
        type: file.mimetype,
        size: file.buffer.length,
        alt_text: options.alt_text,
        folder_id: options.folder_id
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

  async list(options?: { folder_id?: string }): Promise<Media[]> {
    let query = this.supabase
      .from('media')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (options?.folder_id) {
      query = query.eq('folder_id', options.folder_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async update(id: string, input: UpdateMediaInput): Promise<Media> {
    const { data, error } = await this.supabase
      .from('media')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
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
      .eq('id', id);

    if (error) throw error;
  }
}
