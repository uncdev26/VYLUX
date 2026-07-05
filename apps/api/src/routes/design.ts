import { Router } from 'express';
import { DesignService } from '../services/design';

const router = Router();
const service = new DesignService();

// GET /api/design/tokens
router.get('/tokens', async (req, res) => {
  try {
    const tokens = await service.getAllTokens();
    res.json(tokens);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

// POST /api/design/tokens
router.post('/tokens', async (req, res) => {
  try {
    const token = await service.createToken(req.body);
    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// PUT /api/design/tokens/:key
router.put('/tokens/:key', async (req, res) => {
  try {
    const token = await service.updateToken(req.params.key, req.body);
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token' });
  }
});

// DELETE /api/design/tokens/:key
router.delete('/tokens/:key', async (req, res) => {
  try {
    await service.deleteToken(req.params.key);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

export default router;
