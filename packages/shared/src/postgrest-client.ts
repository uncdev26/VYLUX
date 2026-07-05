// Lightweight PostgREST client — drop-in for @supabase/supabase-js
// supabase-js expects /rest/v1/{table}, but PostgREST serves at /{table}
// This client talks directly to PostgREST without the Kong prefix

export interface PostgrestClient {
  from(table: string): PostgrestQueryBuilder;
}

interface PostgrestQueryBuilder {
  select(columns?: string): PostgrestFilterBuilder;
  insert(data: Record<string, unknown> | Record<string, unknown>[]): PostgrestFilterBuilder;
  update(data: Record<string, unknown>): PostgrestFilterBuilder;
  delete(): PostgrestFilterBuilder;
}

interface PostgrestFilterBuilder {
  eq(column: string, value: unknown): PostgrestFilterBuilder;
  neq(column: string, value: unknown): PostgrestFilterBuilder;
  is(column: string, value: null): PostgrestFilterBuilder;
  order(column: string, options?: { ascending?: boolean }): PostgrestFilterBuilder;
  limit(count: number): PostgrestFilterBuilder;
  single(): Promise<{ data: unknown; error: PostgrestError | null }>;
  select(columns?: string): Promise<{ data: unknown; error: PostgrestError | null }>;
}

interface PostgrestError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export function createPostgrestClient(url: string, apiKey: string): PostgrestClient {
  return {
    from(table: string) {
      return new PostgrestQueryBuilderImpl(url, apiKey, table);
    }
  };
}

class PostgrestQueryBuilderImpl implements PostgrestQueryBuilder {
  constructor(
    private baseUrl: string,
    private apiKey: string,
    private table: string
  ) {}

  select(columns = '*') {
    return new PostgrestFilterBuilderImpl(this.baseUrl, this.apiKey, this.table, 'GET', { select: columns });
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    return new PostgrestFilterBuilderImpl(this.baseUrl, this.apiKey, this.table, 'POST', {}, data);
  }

  update(data: Record<string, unknown>) {
    return new PostgrestFilterBuilderImpl(this.baseUrl, this.apiKey, this.table, 'PATCH', {}, data);
  }

  delete() {
    return new PostgrestFilterBuilderImpl(this.baseUrl, this.apiKey, this.table, 'DELETE');
  }
}

class PostgrestFilterBuilderImpl implements PostgrestFilterBuilder {
  private filters: Record<string, string> = {};
  private orderBy?: string;
  private orderAsc = true;
  private limitCount?: number;
  private returnSingle = false;

  constructor(
    private baseUrl: string,
    private apiKey: string,
    private table: string,
    private method: string,
    private queryParams: Record<string, string> = {},
    private body?: unknown
  ) {}

  eq(column: string, value: unknown) {
    this.filters[column] = `eq.${value}`;
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters[column] = `neq.${value}`;
    return this;
  }

  is(column: string, value: null) {
    this.filters[column] = `is.null`;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single(): Promise<{ data: unknown; error: PostgrestError | null }> {
    this.returnSingle = true;
    this.limitCount = 1;
    return this.execute();
  }

  async select(columns?: string): Promise<{ data: unknown; error: PostgrestError | null }> {
    if (columns) this.queryParams.select = columns;
    return this.execute();
  }

  private async execute(): Promise<{ data: unknown; error: PostgrestError | null }> {
    try {
      const url = new URL(`${this.baseUrl}/${this.table}`);
      
      // Add query params
      for (const [key, value] of Object.entries(this.queryParams)) {
        url.searchParams.set(key, value);
      }
      // Add filters
      for (const [key, value] of Object.entries(this.filters)) {
        url.searchParams.set(key, value);
      }
      // Add order
      if (this.orderBy) {
        url.searchParams.set('order', `${this.orderBy}.${this.orderAsc ? 'asc' : 'desc'}`);
      }
      // Add limit
      if (this.limitCount) {
        url.searchParams.set('limit', String(this.limitCount));
      }

      const headers: Record<string, string> = {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': this.returnSingle ? 'return=representation' : 'return=representation',
      };

      if (this.returnSingle) {
        headers['Accept'] = 'application/vnd.pgrst.object+json';
      }

      const res = await fetch(url.toString(), {
        method: this.method,
        headers,
        body: this.body ? JSON.stringify(this.body) : undefined,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: errBody as PostgrestError };
      }

      if (this.method === 'DELETE' && res.status === 204) {
        return { data: null, error: null };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  }
}
