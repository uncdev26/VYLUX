import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Form,
  CreateFormInput,
  UpdateFormInput,
  Submission
} from '@newlight/shared';

export class FormsService {
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async createForm(input: CreateFormInput): Promise<Form> {
    const slug = input.slug || this.generateSlug(input.name);

    const { data, error } = await this.supabase
      .from('forms')
      .insert({
        ...input,
        slug,
        settings: input.settings || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFormById(id: string): Promise<Form | null> {
    const { data, error } = await this.supabase
      .from('forms')
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

  async getFormBySlug(slug: string): Promise<Form | null> {
    const { data, error } = await this.supabase
      .from('forms')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async listForms(): Promise<Form[]> {
    const { data, error } = await this.supabase
      .from('forms')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateForm(id: string, input: UpdateFormInput): Promise<Form> {
    const { data, error } = await this.supabase
      .from('forms')
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

  async deleteForm(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('forms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  }

  async submitForm(formId: string, input: { data: Record<string, unknown> }): Promise<Submission> {
    const { data, error } = await this.supabase
      .from('submissions')
      .insert({
        form_id: formId,
        data: input.data
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listSubmissions(formId: string): Promise<Submission[]> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
