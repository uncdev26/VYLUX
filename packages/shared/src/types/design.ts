export interface DesignToken {
  id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTokenInput {
  key: string;
  value: Record<string, unknown>;
}

export interface UpdateTokenInput {
  value: Record<string, unknown>;
}
