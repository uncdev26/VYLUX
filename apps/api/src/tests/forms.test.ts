import { describe, it, expect, vi, beforeEach } from 'vitest';

// Build a chainable mock that returns { data, error } at the terminal call
function createMockChain(terminalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'is', 'order', 'insert', 'update', 'single', 'limit', 'range'];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  // Terminal: the last call in the chain resolves
  chain.resolve = vi.fn().mockResolvedValue(terminalResult);

  return chain;
}

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom
  }))
}));

import { FormsService } from '../services/forms';

describe('FormsService', () => {
  let service: FormsService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    service = new FormsService();
  });

  describe('constructor', () => {
    it('should throw if SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new FormsService()).toThrow('Missing required environment variable: SUPABASE_URL');
    });

    it('should throw if SUPABASE_ANON_KEY is missing', () => {
      delete process.env.SUPABASE_ANON_KEY;
      expect(() => new FormsService()).toThrow('Missing required environment variable: SUPABASE_ANON_KEY');
    });
  });

  describe('createForm', () => {
    it('should create a form', async () => {
      const mockForm = {
        id: '1',
        name: 'Contact Form',
        slug: 'contact-form',
        fields: [
          { id: '1', type: 'text', label: 'Name', required: true },
          { id: '2', type: 'email', label: 'Email', required: true }
        ],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const form = await service.createForm({
        name: 'Contact Form',
        fields: [
          { id: '1', type: 'text', label: 'Name', required: true },
          { id: '2', type: 'email', label: 'Email', required: true }
        ]
      });

      expect(form).toBeDefined();
      expect(form.name).toBe('Contact Form');
      expect(form.slug).toBe('contact-form');
      expect(form.fields).toHaveLength(2);
    });

    it('should generate slug from name', async () => {
      const mockForm = {
        id: '1',
        name: 'My Test Form',
        slug: 'my-test-form',
        fields: [{ id: '1', type: 'text', label: 'Name' }],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const form = await service.createForm({
        name: 'My Test Form',
        fields: [{ id: '1', type: 'text', label: 'Name' }]
      });

      expect(form.slug).toBe('my-test-form');
    });

    it('should use custom slug when provided', async () => {
      const mockForm = {
        id: '1',
        name: 'Contact Form',
        slug: 'custom-slug',
        fields: [{ id: '1', type: 'text', label: 'Name' }],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const form = await service.createForm({
        name: 'Contact Form',
        slug: 'custom-slug',
        fields: [{ id: '1', type: 'text', label: 'Name' }]
      });

      expect(form.slug).toBe('custom-slug');
    });
  });

  describe('getFormById', () => {
    it('should return form by id', async () => {
      const mockForm = {
        id: '1',
        name: 'Contact Form',
        slug: 'contact-form',
        fields: [],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const form = await service.getFormById('1');

      expect(form).toBeDefined();
      expect(form?.id).toBe('1');
    });

    it('should return null when form not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const form = await service.getFormById('nonexistent');

      expect(form).toBeNull();
    });
  });

  describe('getFormBySlug', () => {
    it('should return form by slug', async () => {
      const mockForm = {
        id: '1',
        name: 'Contact Form',
        slug: 'contact-form',
        fields: [],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const form = await service.getFormBySlug('contact-form');

      expect(form).toBeDefined();
      expect(form?.slug).toBe('contact-form');
    });

    it('should return null when slug not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } });
      const mockIs = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const form = await service.getFormBySlug('nonexistent');

      expect(form).toBeNull();
    });
  });

  describe('listForms', () => {
    it('should list forms', async () => {
      const mockForms = [
        {
          id: '1',
          name: 'Form 1',
          slug: 'form-1',
          fields: [],
          settings: {},
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null
        },
        {
          id: '2',
          name: 'Form 2',
          slug: 'form-2',
          fields: [],
          settings: {},
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          deleted_at: null
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockForms, error: null });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });
      mockFrom.mockReturnValue({ select: mockSelect });

      const forms = await service.listForms();

      expect(Array.isArray(forms)).toBe(true);
      expect(forms).toHaveLength(2);
    });
  });

  describe('updateForm', () => {
    it('should update a form', async () => {
      const mockForm = {
        id: '1',
        name: 'Updated Form',
        slug: 'contact-form',
        fields: [{ id: '1', type: 'text', label: 'Name' }],
        settings: {},
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockForm, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const form = await service.updateForm('1', { name: 'Updated Form' });

      expect(form).toBeDefined();
      expect(form.name).toBe('Updated Form');
    });
  });

  describe('deleteForm', () => {
    it('should soft delete a form', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await service.deleteForm('1');

      expect(mockFrom).toHaveBeenCalledWith('forms');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  describe('submitForm', () => {
    it('should submit form data', async () => {
      const mockSubmission = {
        id: '1',
        form_id: 'form-1',
        data: { name: 'John', email: 'john@example.com' },
        ip_address: null,
        user_agent: null,
        submitted_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockSubmission, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const submission = await service.submitForm('form-1', {
        data: { name: 'John', email: 'john@example.com' }
      });

      expect(submission).toBeDefined();
      expect(submission.form_id).toBe('form-1');
      expect(submission.data).toEqual({ name: 'John', email: 'john@example.com' });
    });
  });

  describe('listSubmissions', () => {
    it('should list submissions for a form', async () => {
      const mockSubmissions = [
        {
          id: '1',
          form_id: 'form-1',
          data: { name: 'John' },
          ip_address: null,
          user_agent: null,
          submitted_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          form_id: 'form-1',
          data: { name: 'Jane' },
          ip_address: null,
          user_agent: null,
          submitted_at: '2024-01-02T00:00:00Z'
        }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockSubmissions, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const submissions = await service.listSubmissions('form-1');

      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions).toHaveLength(2);
    });
  });
});
