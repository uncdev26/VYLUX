import { describe, it, expect, vi, beforeEach } from 'vitest';

// Build a chainable mock that returns { data, error } at the terminal call
function createMockChain(terminalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is', 'order', 'insert', 'update', 'single', 'limit', 'range'];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  // Terminal: the last call in the chain resolves
  chain.resolve = vi.fn().mockResolvedValue(terminalResult);

  return chain;
}

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom
  }))
}));

import { ContentService } from '../services/content';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    service = new ContentService();
  });

  describe('constructor', () => {
    it('should throw if SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new ContentService()).toThrow('Missing required environment variable: SUPABASE_URL');
    });

    it('should throw if SUPABASE_ANON_KEY is missing', () => {
      delete process.env.SUPABASE_ANON_KEY;
      expect(() => new ContentService()).toThrow('Missing required environment variable: SUPABASE_ANON_KEY');
    });
  });

  describe('Posts', () => {
    it('should create a post', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        slug: 'test-post',
        content: 'Hello World',
        excerpt: null,
        status: 'draft',
        author_id: null,
        category_id: null,
        tags: [],
        featured_image: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockChain = createMockChain({ data: mockPost, error: null });
      // insert().select().single() is the path
      mockChain.select = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockPost, error: null }) });
      mockFrom.mockReturnValue({ insert: vi.fn().mockReturnValue(mockChain) });

      const post = await service.createPost({
        title: 'Test Post',
        content: 'Hello World'
      });

      expect(post).toBeDefined();
      expect(post.title).toBe('Test Post');
      expect(post.slug).toBe('test-post');
    });

    it('should generate slug from title', async () => {
      const mockPost = {
        id: '1',
        title: 'Hello World Post',
        slug: 'hello-world-post',
        content: null,
        excerpt: null,
        status: 'draft',
        author_id: null,
        category_id: null,
        tags: [],
        featured_image: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockChain = createMockChain({ data: mockPost, error: null });
      mockChain.select = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockPost, error: null }) });
      mockFrom.mockReturnValue({ insert: vi.fn().mockReturnValue(mockChain) });

      const post = await service.createPost({ title: 'Hello World Post' });

      expect(post.slug).toBe('hello-world-post');
    });

    it('should get post by slug', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        slug: 'test-post',
        content: 'Hello World',
        excerpt: null,
        status: 'draft',
        author_id: null,
        category_id: null,
        tags: [],
        featured_image: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const post = await service.getPostBySlug('test-post');

      expect(post).toBeDefined();
      expect(post?.slug).toBe('test-post');
    });

    it('should return null when post not found (PGRST116)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const post = await service.getPostBySlug('nonexistent');

      expect(post).toBeNull();
    });

    it('should list published posts', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          content: null,
          excerpt: null,
          status: 'published',
          author_id: null,
          category_id: null,
          tags: [],
          featured_image: null,
          seo_title: null,
          seo_description: null,
          published_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        }
      ];

      // Chain: .select('*').is('deleted_at',null).order(...).range(...).eq('status',...)
      const mockEq = vi.fn().mockResolvedValue({ data: mockPosts, error: null, count: 1 });
      const mockRange = vi.fn().mockReturnValue({ eq: mockEq });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.listPosts({ status: 'published' });

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('published');
      expect(result.total).toBe(1);
    });

    it('should update a post', async () => {
      const mockPost = {
        id: '1',
        title: 'Updated Post',
        slug: 'test-post',
        content: 'Updated content',
        excerpt: null,
        status: 'draft',
        author_id: null,
        category_id: null,
        tags: [],
        featured_image: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const post = await service.updatePost('1', { title: 'Updated Post', content: 'Updated content' });

      expect(post).toBeDefined();
      expect(post.title).toBe('Updated Post');
    });

    it('should soft delete a post', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.deletePost('1');

      expect(mockFrom).toHaveBeenCalledWith('posts');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    });

    it('should publish a post', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        slug: 'test-post',
        content: null,
        excerpt: null,
        status: 'published',
        author_id: null,
        category_id: null,
        tags: [],
        featured_image: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const post = await service.publishPost('1');

      expect(post.status).toBe('published');
    });
  });

  describe('Pages', () => {
    it('should create a page', async () => {
      const mockPage = {
        id: '1',
        title: 'About Us',
        slug: 'about-us',
        content: 'About page content',
        status: 'draft',
        template: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPage, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const page = await service.createPage({
        title: 'About Us',
        content: 'About page content'
      });

      expect(page).toBeDefined();
      expect(page.title).toBe('About Us');
      expect(page.slug).toBe('about-us');
    });

    it('should get page by slug', async () => {
      const mockPage = {
        id: '1',
        title: 'About Us',
        slug: 'about-us',
        content: 'About page content',
        status: 'draft',
        template: null,
        seo_title: null,
        seo_description: null,
        published_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockPage, error: null });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const page = await service.getPageBySlug('about-us');

      expect(page).toBeDefined();
      expect(page?.slug).toBe('about-us');
    });

    it('should list pages', async () => {
      const mockPages = [
        {
          id: '1',
          title: 'About Us',
          slug: 'about-us',
          content: null,
          status: 'draft',
          template: null,
          seo_title: null,
          seo_description: null,
          published_at: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        }
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockPages, error: null, count: 1 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.listPages();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('Categories', () => {
    it('should create a category', async () => {
      const mockCategory = {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: null,
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockCategory, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const category = await service.createCategory({ name: 'Technology' });

      expect(category).toBeDefined();
      expect(category.name).toBe('Technology');
      expect(category.slug).toBe('technology');
    });

    it('should list categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Technology',
          slug: 'technology',
          description: null,
          parent_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        }
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockCategories, error: null, count: 1 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.listCategories();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Technology');
      expect(result.total).toBe(1);
    });
  });
});
