import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createPostgrestFetch } from '@newlight/shared';
import type { DesignToken, CreateTokenInput, UpdateTokenInput } from '@newlight/shared';

export class DesignService {
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

    this.supabase = createClient(url, key, {
      global: { fetch: createPostgrestFetch() }
    });
  }

  async createToken(input: CreateTokenInput): Promise<DesignToken> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTokenByKey(key: string): Promise<DesignToken | null> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .select('*')
      .eq('name', key)
      .is('deleted_at', null)
      .single();

    if (error) {
      // PGRST116 = Row not found (PostgREST single() returns this when 0 rows)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async getAllTokens(): Promise<DesignToken[]> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .select('*')
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateToken(key: string, input: UpdateTokenInput): Promise<DesignToken> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('name', key)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteToken(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('design_tokens')
      .update({ deleted_at: new Date().toISOString() })
      .eq('name', key)
      .is('deleted_at', null);

    if (error) throw error;
  }
}
