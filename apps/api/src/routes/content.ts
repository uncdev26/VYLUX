import { Router } from 'express';
import { z } from 'zod';
import { ContentService } from '../services/content';

const router = Router();
const service = new ContentService();

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

// ── Posts ────────────────────────────────────────────────────────────

// GET /api/content/posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await service.listPosts(req.query as { status?: string; category_id?: string });
    res.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
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
    const post = await service.createPost(parsed.data);
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
    const post = await service.updatePost(req.params.id, parsed.data);
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
    const pages = await service.listPages();
    res.json(pages);
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
    const page = await service.createPage(parsed.data);
    res.status(201).json(page);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Page with this slug already exists' });
    }
    console.error('Failed to create page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// ── Categories ───────────────────────────────────────────────────────

// GET /api/content/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await service.listCategories();
    res.json(categories);
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
    const category = await service.createCategory(parsed.data);
    res.status(201).json(category);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    console.error('Failed to create category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
