import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as cmsSchemas from './schemas/cms';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, {
  schema: cmsSchemas,
});

export { pool };
export * from './schemas/cms';
export { generateSlug, whereNotDeleted } from './utils';
