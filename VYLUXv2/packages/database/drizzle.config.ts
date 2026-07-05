import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas/cms',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['cms'],
  tablesFilter: ['*'],
});
