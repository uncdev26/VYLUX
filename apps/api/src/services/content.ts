import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  Page,
  CreatePageInput,
  UpdatePageInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput
} from '@newlight/shared';

export class ContentService {
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

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // ── Posts ──────────────────────────────────────────────────────────

  async createPost(input: CreatePostInput): Promise<Post> {
    const slug = input.slug || this.generateSlug(input.title);

    const { data, error } = await this.supabase
      .from('posts')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await this.supabase
      .from('posts')
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

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await this.supabase
      .from('posts')
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

  async listPosts(filters?: { status?: string; category_id?: string }): Promise<Post[]> {
    let query = this.supabase
      .from('posts')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const { data, error } = await this.supabase
      .from('posts')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async publishPost(id: string): Promise<Post> {
    return this.updatePost(id, { status: 'published' });
  }

  // ── Pages ──────────────────────────────────────────────────────────

  async createPage(input: CreatePageInput): Promise<Page> {
    const slug = input.slug || this.generateSlug(input.title);

    const { data, error } = await this.supabase
      .from('pages')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await this.supabase
      .from('pages')
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

  async listPages(): Promise<Page[]> {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .is('deleted_at', null)
      .order('title');

    if (error) throw error;
    return data || [];
  }

  async updatePage(id: string, input: UpdatePageInput): Promise<Page> {
    const { data, error } = await this.supabase
      .from('pages')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // ── Categories ─────────────────────────────────────────────────────

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = this.generateSlug(input.name);

    const { data, error } = await this.supabase
      .from('categories')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
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

  async listCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
