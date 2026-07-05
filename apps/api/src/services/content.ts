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

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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

  async listPosts(
    filters?: { status?: string; category_id?: string },
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Post>> {
    const limit = Math.min(pagination?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = pagination?.offset ?? 0;

    let query = this.supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], total: count ?? 0 };
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

  async listPages(pagination?: PaginationParams): Promise<PaginatedResult<Page>> {
    const limit = Math.min(pagination?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = pagination?.offset ?? 0;

    const { data, error, count } = await this.supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('title')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count ?? 0 };
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

  async listCategories(pagination?: PaginationParams): Promise<PaginatedResult<Category>> {
    const limit = Math.min(pagination?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const offset = pagination?.offset ?? 0;

    const { data, error, count } = await this.supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count ?? 0 };
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
