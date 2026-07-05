export interface Media {
  id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  metadata: Record<string, unknown> | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface UploadMediaInput {
  alt_text?: string;
  caption?: string;
  folder_id?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateMediaInput {
  alt_text?: string;
  caption?: string;
  folder_id?: string;
  metadata?: Record<string, unknown>;
}
