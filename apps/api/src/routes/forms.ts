import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { FormsService } from '../services/forms';
import { requireAuth } from '../middleware/auth';
import type { FormField } from '@newlight/shared';

const router = Router();
const service = new FormsService();

// ── Constants ────────────────────────────────────────────────────────

const MAX_SUBMISSION_SIZE_BYTES = 1024 * 1024; // 1MB

// ── Typed errors ─────────────────────────────────────────────────────

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

function isPostgresError(error: unknown): error is { code: string; message: string } {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

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

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

// ── Submission validation ────────────────────────────────────────────

function validateSubmissionData(
  data: Record<string, unknown>,
  fields: FormField[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  for (const field of fields) {
    if (field.required && (data[field.id] === undefined || data[field.id] === null || data[field.id] === '')) {
      errors.push(`Field "${field.label}" is required`);
    }
  }

  // Validate field types for provided values
  for (const [fieldId, value] of Object.entries(data)) {
    const field = fields.find(f => f.id === fieldId);
    if (!field) continue; // Allow extra fields (they'll be stored as-is)

    if (value === null || value === undefined || value === '') continue; // Skip empty values

    switch (field.type) {
      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`Field "${field.label}" must be a valid email address`);
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`Field "${field.label}" must be a number`);
        }
        break;
      case 'select':
      case 'radio':
        if (field.options && field.options.length > 0 && !field.options.includes(String(value))) {
          errors.push(`Field "${field.label}" must be one of: ${field.options.join(', ')}`);
        }
        break;
      case 'checkbox':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== '1' && value !== '0') {
          errors.push(`Field "${field.label}" must be a boolean value`);
        }
        break;
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.label}" must be a string`);
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Error handler ────────────────────────────────────────────────────

function handleApiError(res: Response, error: unknown, context: string): void {
  if (isPostgresError(error)) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Form with this slug already exists' });
      return;
    }
    if (error.code === 'PGRST116') {
      res.status(404).json({ error: 'Form not found' });
      return;
    }
  }
  console.error(`${context}:`, error);
  res.status(500).json({ error: context });
}

// ── Apply auth to all form management routes ─────────────────────────

router.use(requireAuth);

// ── Form CRUD ────────────────────────────────────────────────────────

// GET /api/forms
router.get('/', async (req: Request, res: Response) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await service.listForms(pagination);
    res.json(result);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch forms');
  }
});

// GET /api/forms/by-id/:id
router.get('/by-id/:id', async (req: Request, res: Response) => {
  try {
    const form = await service.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch form');
  }
});

// GET /api/forms/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const form = await service.getFormBySlug(req.params.slug);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch form');
  }
});

// POST /api/forms
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const form = await service.createForm(parsed.data);
    res.status(201).json(form);
  } catch (error) {
    handleApiError(res, error, 'Failed to create form');
  }
});

// PUT /api/forms/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const form = await service.updateForm(req.params.id, parsed.data);
    res.json(form);
  } catch (error) {
    handleApiError(res, error, 'Failed to update form');
  }
});

// DELETE /api/forms/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteForm(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleApiError(res, error, 'Failed to delete form');
  }
});

// ── Submissions ──────────────────────────────────────────────────────

// GET /api/forms/:id/submissions
router.get('/:id/submissions', async (req: Request, res: Response) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await service.listSubmissions(req.params.id, pagination);
    res.json(result);
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch submissions');
  }
});

// ── Public submit endpoint (no auth) ─────────────────────────────────

const submitRouter = Router();

// POST /api/forms-submit/:id/submit
submitRouter.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    // Check payload size
    const contentLength = Number(req.headers['content-length'] || 0);
    if (contentLength > MAX_SUBMISSION_SIZE_BYTES) {
      return res.status(413).json({
        error: 'Payload too large',
        message: `Submission data must not exceed ${MAX_SUBMISSION_SIZE_BYTES / 1024 / 1024}MB`
      });
    }

    // Validate data field exists and is an object
    if (!req.body.data || typeof req.body.data !== 'object' || Array.isArray(req.body.data)) {
      return res.status(400).json({ error: 'Invalid submission data', message: 'data must be a JSON object' });
    }

    const form = await service.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.status !== 'active') {
      return res.status(400).json({ error: 'Form is not active' });
    }

    // Validate submission data against form fields
    const validation = validateSubmissionData(req.body.data, form.fields);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Submission data does not match form requirements',
        details: validation.errors
      });
    }

    const submission = await service.submitForm(req.params.id, {
      data: req.body.data
    });

    res.status(201).json(submission);
  } catch (error) {
    handleApiError(res, error, 'Failed to submit form');
  }
});

export { submitRouter };
export default router;
