// Database connection for Astro SSR
// Queries the CMS schema in the same ParadeDB instance as LobeHub
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { posts, pages, categories, designTokens, seoConfigs, media, menuItems, headerConfigs, footerConfigs } from '@lobechat/database/schemas/cms';

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL || process.env.DATABASE_URL,
  max: 5,
});

export const db = drizzle(pool);

export { posts, pages, categories, designTokens, seoConfigs, media, menuItems, headerConfigs, footerConfigs };
