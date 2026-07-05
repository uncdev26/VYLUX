export interface Media {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  alt_text: string | null;
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
  folder_id?: string;
}

export interface UpdateMediaInput {
  alt_text?: string;
  folder_id?: string;
}
