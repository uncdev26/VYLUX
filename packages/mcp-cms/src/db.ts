// Database connection for MCP CMS server
// Connects to the same PostgreSQL database as LobeHub via DATABASE_URL
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as cmsSchemas from '@lobechat/database/schemas/cms';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export const db = drizzle(pool, {
  schema: cmsSchemas,
});

export { pool };
