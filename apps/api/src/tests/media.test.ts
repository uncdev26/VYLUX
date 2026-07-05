import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage upload
const mockStorageUpload = vi.fn().mockResolvedValue({ error: null });
const mockStorageGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg' }
});

// Build a chainable mock for database operations
function createChainMock(terminalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is', 'order', 'insert', 'update', 'single'];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  // Terminal resolution
  chain.then = (resolve: Function) => resolve(terminalResult);

  return chain;
}

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    storage: {
      from: vi.fn(() => ({
        upload: mockStorageUpload,
        getPublicUrl: mockStorageGetPublicUrl
      }))
    }
  }))
}));

import { MediaService } from '../services/media';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    service = new MediaService();
  });

  describe('constructor', () => {
    it('should throw if SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new MediaService()).toThrow('Missing required environment variable: SUPABASE_URL');
    });

    it('should throw if SUPABASE_ANON_KEY is missing', () => {
      delete process.env.SUPABASE_ANON_KEY;
      expect(() => new MediaService()).toThrow('Missing required environment variable: SUPABASE_ANON_KEY');
    });
  });

  describe('upload', () => {
    it('should upload a file', async () => {
      const mockMedia = {
        id: '1',
        filename: 'test.jpg',
        url: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg',
        type: 'image/jpeg',
        size: 4,
        alt_text: 'Test image',
        folder_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockMedia, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };

      const media = await service.upload(file, { alt_text: 'Test image' });

      expect(media).toBeDefined();
      expect(media.filename).toBe('test.jpg');
      expect(media.type).toBe('image/jpeg');
      expect(media.alt_text).toBe('Test image');
      expect(mockStorageUpload).toHaveBeenCalled();
    });

    it('should throw on storage upload error', async () => {
      mockStorageUpload.mockResolvedValueOnce({ error: new Error('Upload failed') });

      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };

      await expect(service.upload(file)).rejects.toThrow('Upload failed');
    });
  });

  describe('getById', () => {
    it('should get media by id', async () => {
      const mockMedia = {
        id: '1',
        filename: 'test.jpg',
        url: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg',
        type: 'image/jpeg',
        size: 4,
        alt_text: null,
        folder_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockMedia, error: null });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const media = await service.getById('1');

      expect(media).toBeDefined();
      expect(media?.id).toBe('1');
      expect(mockFrom).toHaveBeenCalledWith('media');
    });

    it('should return null when media not found (PGRST116)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const media = await service.getById('nonexistent');

      expect(media).toBeNull();
    });
  });

  describe('list', () => {
    it('should list media files', async () => {
      const mockMedia = [
        {
          id: '1',
          filename: 'test.jpg',
          url: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg',
          type: 'image/jpeg',
          size: 4,
          alt_text: null,
          folder_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockMedia, error: null });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const media = await service.list();

      expect(Array.isArray(media)).toBe(true);
      expect(media).toHaveLength(1);
    });

    it('should filter by folder_id', async () => {
      const mockMedia: unknown[] = [];

      const mockEq = vi.fn().mockResolvedValue({ data: mockMedia, error: null });
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const media = await service.list({ folder_id: 'folder-1' });

      expect(Array.isArray(media)).toBe(true);
      expect(mockEq).toHaveBeenCalledWith('folder_id', 'folder-1');
    });
  });

  describe('update', () => {
    it('should update media metadata', async () => {
      const mockMedia = {
        id: '1',
        filename: 'test.jpg',
        url: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg',
        type: 'image/jpeg',
        size: 4,
        alt_text: 'Updated alt text',
        folder_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockMedia, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const media = await service.update('1', { alt_text: 'Updated alt text' });

      expect(media).toBeDefined();
      expect(media.alt_text).toBe('Updated alt text');
    });
  });

  describe('delete', () => {
    it('should soft delete media', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.delete('1');

      expect(mockFrom).toHaveBeenCalledWith('media');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    });
  });
});
