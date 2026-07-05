import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { MediaService } from '../services/media';
import { requireAuth } from '../middleware/auth';

const router = Router();
const service = new MediaService();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Apply auth to all media routes
router.use(requireAuth);

// Validation schemas
const updateMediaSchema = z.object({
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  folder_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// GET /api/media
router.get('/', async (req, res) => {
  try {
    const pagination = paginationSchema.safeParse(req.query);
    const folder_id = req.query.folder_id as string | undefined;

    const result = await service.list(
      { folder_id },
      pagination.success ? pagination.data : undefined,
    );
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// GET /api/media/:id
router.get('/:id', async (req, res) => {
  try {
    const media = await service.getById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    console.error('Failed to fetch media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// POST /api/media
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const media = await service.upload(req.file, {
      alt_text: req.body.alt_text,
      caption: req.body.caption,
      folder_id: req.body.folder_id,
      width: req.body.width ? Number(req.body.width) : undefined,
      height: req.body.height ? Number(req.body.height) : undefined,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
    });

    res.status(201).json(media);
  } catch (error: any) {
    if (error?.message?.includes('exceeds maximum size') || error?.message?.includes('not allowed')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Failed to upload media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// PUT /api/media/:id
router.put('/:id', async (req, res) => {
  try {
    const parsed = updateMediaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const media = await service.update(req.params.id, parsed.data);
    res.json(media);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Media not found' });
    }
    console.error('Failed to update media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// DELETE /api/media/:id
router.delete('/:id', async (req, res) => {
  try {
    await service.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;
