export type FormStatus = 'active' | 'inactive' | 'archived';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

export interface FormSettings {
  submit_message?: string;
  redirect_url?: string;
  notify_email?: string;
  require_auth?: boolean;
  max_submissions?: number;
  [key: string]: unknown;
}

export interface Form {
  id: string;
  name: string;
  slug: string;
  fields: FormField[];
  settings: FormSettings;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateFormInput {
  name: string;
  slug?: string;
  fields: FormField[];
  settings?: FormSettings;
}

export interface UpdateFormInput {
  name?: string;
  fields?: FormField[];
  settings?: FormSettings;
  status?: FormStatus;
}

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
