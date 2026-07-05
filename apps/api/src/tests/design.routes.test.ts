import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Set env vars before router module loads (DesignService constructor runs at import)
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

// Hoisted mock so it's available in vi.mock factory
const { mockService } = vi.hoisted(() => ({
  mockService: {
    getAllTokens: vi.fn(),
    getTokenByKey: vi.fn(),
    createToken: vi.fn(),
    updateToken: vi.fn(),
    deleteToken: vi.fn(),
  },
}));

vi.mock('../services/design', () => {
  function DesignService() {}
  DesignService.prototype.getAllTokens = mockService.getAllTokens;
  DesignService.prototype.getTokenByKey = mockService.getTokenByKey;
  DesignService.prototype.createToken = mockService.createToken;
  DesignService.prototype.updateToken = mockService.updateToken;
  DesignService.prototype.deleteToken = mockService.deleteToken;
  return { DesignService };
});

import request from 'supertest';
import express from 'express';
import router from '../routes/design';

const app = express();
app.use(express.json());
app.use('/api/design', router);

describe('Design Tokens API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /tokens - returns all tokens', async () => {
    const tokens = [
      { id: '1', key: 'colors', value: { primary: '#FF0000' }, created_at: '2024-01-01', updated_at: '2024-01-01', deleted_at: null },
    ];
    (mockService.getAllTokens as Mock).mockResolvedValue(tokens);

    const res = await request(app).get('/api/design/tokens');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tokens);
  });

  it('GET /tokens - returns 500 on service error', async () => {
    (mockService.getAllTokens as Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/design/tokens');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch tokens');
  });

  it('GET /tokens/:key - returns a token', async () => {
    const token = { id: '1', key: 'colors', value: { primary: '#FF0000' }, created_at: '2024-01-01', updated_at: '2024-01-01', deleted_at: null };
    (mockService.getTokenByKey as Mock).mockResolvedValue(token);

    const res = await request(app).get('/api/design/tokens/colors');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(token);
  });

  it('GET /tokens/:key - returns 404 when not found', async () => {
    (mockService.getTokenByKey as Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/design/tokens/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Token not found');
  });

  it('POST /tokens - creates a token', async () => {
    const token = { id: '1', key: 'colors', value: { primary: '#FF0000' }, created_at: '2024-01-01', updated_at: '2024-01-01', deleted_at: null };
    (mockService.createToken as Mock).mockResolvedValue(token);

    const res = await request(app)
      .post('/api/design/tokens')
      .send({ key: 'colors', value: { primary: '#FF0000' } });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(token);
  });

  it('POST /tokens - returns 400 on missing key', async () => {
    const res = await request(app)
      .post('/api/design/tokens')
      .send({ value: { primary: '#FF0000' } });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toBeDefined();
  });

  it('POST /tokens - returns 400 when value is not an object', async () => {
    const res = await request(app)
      .post('/api/design/tokens')
      .send({ key: 'colors', value: 'not-an-object' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('POST /tokens - returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/design/tokens')
      .send({});

    expect(res.status).toBe(400);
  });

  it('POST /tokens - returns 409 on duplicate key', async () => {
    (mockService.createToken as Mock).mockRejectedValue({ code: '23505', message: 'duplicate key' });

    const res = await request(app)
      .post('/api/design/tokens')
      .send({ key: 'colors', value: { primary: '#FF0000' } });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Token with this key already exists');
  });

  it('POST /tokens - returns 500 on unknown error', async () => {
    (mockService.createToken as Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/api/design/tokens')
      .send({ key: 'colors', value: { primary: '#FF0000' } });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to create token');
  });

  it('PUT /tokens/:key - updates a token', async () => {
    const token = { id: '1', key: 'colors', value: { primary: '#00FF00' }, created_at: '2024-01-01', updated_at: '2024-01-02', deleted_at: null };
    (mockService.updateToken as Mock).mockResolvedValue(token);

    const res = await request(app)
      .put('/api/design/tokens/colors')
      .send({ value: { primary: '#00FF00' } });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(token);
  });

  it('PUT /tokens/:key - returns 400 on validation failure', async () => {
    const res = await request(app)
      .put('/api/design/tokens/colors')
      .send({ invalid: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PUT /tokens/:key - returns 404 when not found', async () => {
    (mockService.updateToken as Mock).mockRejectedValue({ code: 'PGRST116', message: 'Not found' });

    const res = await request(app)
      .put('/api/design/tokens/nonexistent')
      .send({ value: { primary: '#00FF00' } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Token not found');
  });

  it('DELETE /tokens/:key - deletes a token', async () => {
    (mockService.deleteToken as Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/api/design/tokens/colors');

    expect(res.status).toBe(204);
  });

  it('DELETE /tokens/:key - returns 500 on error', async () => {
    (mockService.deleteToken as Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/design/tokens/colors');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to delete token');
  });
});
