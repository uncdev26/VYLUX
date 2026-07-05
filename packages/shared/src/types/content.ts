export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: ContentStatus;
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: ContentStatus;
  category_id?: string;
  tags?: string[];
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: ContentStatus;
  category_id?: string;
  tags?: string[];
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: ContentStatus;
  template: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreatePageInput {
  title: string;
  slug?: string;
  content?: string;
  template?: string;
  status?: ContentStatus;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePageInput {
  title?: string;
  content?: string;
  template?: string;
  status?: ContentStatus;
  seo_title?: string;
  seo_description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parent_id?: string;
}
