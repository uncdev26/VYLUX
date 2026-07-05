import { createClient } from '@supabase/supabase-js';
import type { DesignToken, CreateTokenInput, UpdateTokenInput } from '@newlight/shared';

export class DesignService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
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
      .eq('key', key)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  }

  async getAllTokens(): Promise<DesignToken[]> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .select('*')
      .is('deleted_at', null)
      .order('key');

    if (error) throw error;
    return data || [];
  }

  async updateToken(key: string, input: UpdateTokenInput): Promise<DesignToken> {
    const { data, error } = await this.supabase
      .from('design_tokens')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('key', key)
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
      .eq('key', key);

    if (error) throw error;
  }
}
