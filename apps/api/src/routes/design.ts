import { Router } from 'express';
import { z } from 'zod';
import { DesignService } from '../services/design';

const router = Router();
const service = new DesignService();

const createTokenSchema = z.object({
  key: z.string().min(1, 'key is required'),
  value: z.record(z.unknown()),
});

const updateTokenSchema = z.object({
  value: z.record(z.unknown()),
});

// GET /api/design/tokens
router.get('/tokens', async (req, res) => {
  try {
    const tokens = await service.getAllTokens();
    res.json(tokens);
  } catch (error) {
    console.error('Failed to fetch tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

// GET /api/design/tokens/:key
router.get('/tokens/:key', async (req, res) => {
  try {
    const token = await service.getTokenByKey(req.params.key);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    console.error('Failed to fetch token:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

// POST /api/design/tokens
router.post('/tokens', async (req, res) => {
  try {
    const parsed = createTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const token = await service.createToken(parsed.data);
    res.status(201).json(token);
  } catch (error: any) {
    // PostgREST unique violation (duplicate key)
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Token with this key already exists' });
    }
    console.error('Failed to create token:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// PUT /api/design/tokens/:key
router.put('/tokens/:key', async (req, res) => {
  try {
    const parsed = updateTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const token = await service.updateToken(req.params.key, parsed.data);
    res.json(token);
  } catch (error: any) {
    // PGRST116 = Row not found from single()
    if (error?.code === 'PGRST116') {
      return res.status(404).json({ error: 'Token not found' });
    }
    console.error('Failed to update token:', error);
    res.status(500).json({ error: 'Failed to update token' });
  }
});

// DELETE /api/design/tokens/:key
router.delete('/tokens/:key', async (req, res) => {
  try {
    await service.deleteToken(req.params.key);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete token:', error);
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

export default router;
