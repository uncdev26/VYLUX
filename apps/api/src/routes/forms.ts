import { Router } from 'express';
import { z } from 'zod';
import { FormsService } from '../services/forms';
import { requireAuth } from '../middleware/auth';

const router = Router();
const service = new FormsService();

// ── Validation schemas ───────────────────────────────────────────────

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  validation: z.record(z.unknown()).optional()
});

const createFormSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().optional(),
  fields: z.array(formFieldSchema).min(1, 'at least one field is required'),
  settings: z.record(z.unknown()).optional()
});

const updateFormSchema = z.object({
  name: z.string().min(1).optional(),
  fields: z.array(formFieldSchema).optional(),
  settings: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

// ── Apply auth to all form management routes ─────────────────────────

router.use(requireAuth);

// ── Form CRUD ────────────────────────────────────────────────────────

// GET /api/forms
router.get('/', async (req, res) => {
  try {
    const forms = await service.listForms();
    res.json(forms);
  } catch (error) {
    console.error('Failed to fetch forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// GET /api/forms/by-id/:id
router.get('/by-id/:id', async (req, res) => {
  try {
    const form = await service.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Failed to fetch form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// GET /api/forms/:slug
router.get('/:slug', async (req, res) => {
  try {
    const form = await service.getFormBySlug(req.params.slug);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Failed to fetch form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// POST /api/forms
router.post('/', async (req, res) => {
  try {
    const parsed = createFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const form = await service.createForm(parsed.data);
    res.status(201).json(form);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Form with this slug already exists' });
    }
    console.error('Failed to create form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// PUT /api/forms/:id
router.put('/:id', async (req, res) => {
  try {
    const parsed = updateFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const form = await service.updateForm(req.params.id, parsed.data);
    res.json(form);
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Form not found' });
    }
    console.error('Failed to update form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// DELETE /api/forms/:id
router.delete('/:id', async (req, res) => {
  try {
    await service.deleteForm(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// ── Submissions ──────────────────────────────────────────────────────

// GET /api/forms/:id/submissions
router.get('/:id/submissions', async (req, res) => {
  try {
    const submissions = await service.listSubmissions(req.params.id);
    res.json(submissions);
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ── Public submit endpoint (no auth) ─────────────────────────────────

const submitRouter = Router();

// POST /api/forms-submit/:id/submit
submitRouter.post('/:id/submit', async (req, res) => {
  try {
    const form = await service.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.status !== 'active') {
      return res.status(400).json({ error: 'Form is not active' });
    }

    const submission = await service.submitForm(req.params.id, {
      data: req.body.data
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Failed to submit form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

export { submitRouter };
export default router;
