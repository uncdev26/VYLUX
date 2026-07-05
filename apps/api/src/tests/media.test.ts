import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage upload
const mockStorageUpload = vi.fn().mockResolvedValue({ error: null });
const mockStorageGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/assets/media/test.jpg' }
});

// Build a chainable mock for database operations
function createChainMock(terminalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is', 'order', 'insert', 'update', 'single', 'range'];

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
        storage_path: 'media/1.jpg',
        mime_type: 'image/jpeg',
        size: 4,
        width: null,
        height: null,
        alt_text: 'Test image',
        caption: null,
        metadata: null,
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
      expect(media.mime_type).toBe('image/jpeg');
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

    it('should reject files exceeding max size', async () => {
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024); // 51MB
      const file = {
        buffer: largeBuffer,
        originalname: 'large.jpg',
        mimetype: 'image/jpeg'
      };

      await expect(service.upload(file)).rejects.toThrow('exceeds maximum size');
    });

    it('should reject disallowed MIME types', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'script.exe',
        mimetype: 'application/x-executable'
      };

      await expect(service.upload(file)).rejects.toThrow('not allowed');
    });
  });

  describe('getById', () => {
    it('should get media by id', async () => {
      const mockMedia = {
        id: '1',
        filename: 'test.jpg',
        storage_path: 'media/1.jpg',
        mime_type: 'image/jpeg',
        size: 4,
        width: null,
        height: null,
        alt_text: null,
        caption: null,
        metadata: null,
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
    it('should list media files with pagination', async () => {
      const mockMedia = [
        {
          id: '1',
          filename: 'test.jpg',
          storage_path: 'media/1.jpg',
          mime_type: 'image/jpeg',
          size: 4,
          width: null,
          height: null,
          alt_text: null,
          caption: null,
          metadata: null,
          folder_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        }
      ];

      const mockRange = vi.fn().mockResolvedValue({ data: mockMedia, error: null, count: 1 });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.list();

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by folder_id', async () => {
      const mockMedia: unknown[] = [];

      // Chain: select -> is -> order -> range -> eq -> (terminal)
      // range is called before eq in the service
      const mockEqTerminal = vi.fn().mockResolvedValue({ data: mockMedia, error: null, count: 0 });
      const mockRange = vi.fn().mockReturnValue({ eq: mockEqTerminal });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await service.list({ folder_id: 'folder-1' });

      expect(Array.isArray(result.data)).toBe(true);
      expect(mockEqTerminal).toHaveBeenCalledWith('folder_id', 'folder-1');
    });
  });

  describe('update', () => {
    it('should update media metadata', async () => {
      const mockMedia = {
        id: '1',
        filename: 'test.jpg',
        storage_path: 'media/1.jpg',
        mime_type: 'image/jpeg',
        size: 4,
        width: null,
        height: null,
        alt_text: 'Updated alt text',
        caption: null,
        metadata: null,
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
    it('should soft delete media with deleted_at guard', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.delete('1');

      expect(mockFrom).toHaveBeenCalledWith('media');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    });
  });
});
