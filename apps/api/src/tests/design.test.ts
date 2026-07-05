import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockUpdate = vi.fn(() => ({ select: mockSelect, eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis() }));
const mockEq = vi.fn().mockReturnThis();
const mockIs = vi.fn().mockReturnThis();
const mockOrder = vi.fn();

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: vi.fn(() => ({
    eq: mockEq,
    is: mockIs,
    single: mockSingle,
    order: mockOrder
  })),
  update: mockUpdate
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom
  }))
}));

import { DesignService } from '../services/design';

describe('DesignService', () => {
  let service: DesignService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    service = new DesignService();
  });

  it('should throw if SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;
    expect(() => new DesignService()).toThrow('Missing required environment variable: SUPABASE_URL');
  });

  it('should throw if SUPABASE_ANON_KEY is missing', () => {
    delete process.env.SUPABASE_ANON_KEY;
    expect(() => new DesignService()).toThrow('Missing required environment variable: SUPABASE_ANON_KEY');
  });

  it('should create a design token', async () => {
    const mockToken = {
      id: '1',
      key: 'test-color',
      value: { primary: '#FF0000' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null
    };

    mockSingle.mockResolvedValue({ data: mockToken, error: null });

    const token = await service.createToken({
      key: 'test-color',
      value: { primary: '#FF0000' }
    });

    expect(token).toBeDefined();
    expect(token.key).toBe('test-color');
    expect(token.value).toEqual({ primary: '#FF0000' });
    expect(mockFrom).toHaveBeenCalledWith('design_tokens');
    expect(mockInsert).toHaveBeenCalledWith({ key: 'test-color', value: { primary: '#FF0000' } });
  });

  it('should get a token by key', async () => {
    const mockToken = {
      id: '1',
      key: 'colors',
      value: { primary: '#FF0000' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      deleted_at: null
    };

    mockSingle.mockResolvedValue({ data: mockToken, error: null });

    const token = await service.getTokenByKey('colors');

    expect(token).toBeDefined();
    expect(token?.key).toBe('colors');
    expect(mockFrom).toHaveBeenCalledWith('design_tokens');
  });

  it('should return null when token not found (PGRST116)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } });

    const token = await service.getTokenByKey('nonexistent');

    expect(token).toBeNull();
  });

  it('should throw on non-PGRST116 errors in getTokenByKey', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST200', message: 'Database error' } });

    await expect(service.getTokenByKey('bad-key')).rejects.toEqual({ code: 'PGRST200', message: 'Database error' });
  });

  it('should get all tokens', async () => {
    const mockTokens = [
      {
        id: '1',
        key: 'colors',
        value: { primary: '#FF0000' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      },
      {
        id: '2',
        key: 'spacing',
        value: { small: '4px', medium: '8px' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      }
    ];

    mockOrder.mockResolvedValue({ data: mockTokens, error: null });

    const tokens = await service.getAllTokens();

    expect(tokens).toHaveLength(2);
    expect(tokens[0].key).toBe('colors');
    expect(tokens[1].key).toBe('spacing');
  });

  it('should update a token', async () => {
    const mockToken = {
      id: '1',
      key: 'colors',
      value: { primary: '#00FF00' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      deleted_at: null
    };

    mockSingle.mockResolvedValue({ data: mockToken, error: null });

    const token = await service.updateToken('colors', {
      value: { primary: '#00FF00' }
    });

    expect(token).toBeDefined();
    expect(token.value).toEqual({ primary: '#00FF00' });
    expect(mockFrom).toHaveBeenCalledWith('design_tokens');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should delete a token (soft delete)', async () => {
    const mockEqChain = vi.fn().mockReturnThis();
    const mockIsChain = vi.fn().mockReturnValue({ eq: mockEqChain });
    mockUpdate.mockReturnValue({ eq: mockEqChain, is: mockIsChain });

    await service.deleteToken('test-color');

    expect(mockFrom).toHaveBeenCalledWith('design_tokens');
    expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
  });
});
