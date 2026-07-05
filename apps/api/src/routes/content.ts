import { Router } from 'express';
import { z } from 'zod';
import { ContentService } from '../services/content';
import { requireAuth } from '../middleware/auth';
import { sanitizeFields } from '../utils/sanitize';

const router = Router();
const service = new ContentService();

// Content fields that need HTML sanitization
const SANITIZE_FIELDS = ['content', 'excerpt', 'seo_description', 'description'];

// ── Helper ───────────────────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>) {
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
  const offset = Math.max(0, Number(query.offset) || 0);
  return { limit, offset };
}

// ── Validation schemas ───────────────────────────────────────────────

const createPostSchema = z.object({
  title: z.string().min(1, 'title is required'),
  slug: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().url().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

// slug is omitted because changing a published URL breaks links and SEO;
// use a dedicated redirect/rename flow instead.
const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().url().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  template: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});

const createPageSchema = z.object({
  title: z.string().min(1, 'title is required'),
  slug: z.string().optional(),
  content: z.string().optional(),
  template: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});

// ── Apply auth to all content routes ─────────────────────────────────

router.use(requireAuth);

// ── Posts ────────────────────────────────────────────────────────────

// GET /api/content/posts
router.get('/posts', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await service.listPosts(
      req.query as { status?: string; category_id?: string },
      pagination,
    );
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/content/posts/by-id/:id
router.get('/posts/by-id/:id', async (req, res) => {
  try {
    const post = await service.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /api/content/posts/:slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await service.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/content/posts
router.post('/posts', async (req, res) => {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, SANITIZE_FIELDS);
    const post = await service.createPost(sanitized);
    res.status(201).json(post);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Post with this slug already exists' });
    }
    console.error('Failed to create post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/content/posts/:id
router.put('/posts/:id', async (req, res) => {
  try {
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, SANITIZE_FIELDS);
    const post = await service.updatePost(req.params.id, sanitized);
    res.json(post);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.error('Failed to update post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/content/posts/:id
router.delete('/posts/:id', async (req, res) => {
  try {
    await service.deletePost(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/content/posts/:id/publish
router.post('/posts/:id/publish', async (req, res) => {
  try {
    const post = await service.publishPost(req.params.id);
    res.json(post);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Post not found' });
    }
    console.error('Failed to publish post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// ── Pages ────────────────────────────────────────────────────────────

// GET /api/content/pages
router.get('/pages', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await service.listPages(pagination);
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// GET /api/content/pages/:slug
router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await service.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// POST /api/content/pages
router.post('/pages', async (req, res) => {
  try {
    const parsed = createPageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, SANITIZE_FIELDS);
    const page = await service.createPage(sanitized);
    res.status(201).json(page);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Page with this slug already exists' });
    }
    console.error('Failed to create page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// PUT /api/content/pages/:id
router.put('/pages/:id', async (req, res) => {
  try {
    const parsed = updatePageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, SANITIZE_FIELDS);
    const page = await service.updatePage(req.params.id, sanitized);
    res.json(page);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Page not found' });
    }
    console.error('Failed to update page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// DELETE /api/content/pages/:id
router.delete('/pages/:id', async (req, res) => {
  try {
    await service.deletePage(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// ── Categories ───────────────────────────────────────────────────────

// GET /api/content/categories
router.get('/categories', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await service.listCategories(pagination);
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/content/categories
router.post('/categories', async (req, res) => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, ['description']);
    const category = await service.createCategory(sanitized);
    res.status(201).json(category);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    console.error('Failed to create category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/content/categories/:id
router.put('/categories/:id', async (req, res) => {
  try {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const sanitized = sanitizeFields(parsed.data, ['description']);
    const category = await service.updateCategory(req.params.id, sanitized);
    res.json(category);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.error('Failed to update category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/content/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    await service.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
