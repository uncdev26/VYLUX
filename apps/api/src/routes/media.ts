import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { MediaService } from '../services/media';
import { requireAuth } from '../middleware/auth';

const router = Router();
const service = new MediaService();
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth to all media routes
router.use(requireAuth);

// Validation schemas
const updateMediaSchema = z.object({
  alt_text: z.string().optional(),
  folder_id: z.string().uuid().optional(),
});

// GET /api/media
router.get('/', async (req, res) => {
  try {
    const media = await service.list(req.query as { folder_id?: string });
    res.json(media);
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
      folder_id: req.body.folder_id
    });

    res.status(201).json(media);
  } catch (error) {
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
