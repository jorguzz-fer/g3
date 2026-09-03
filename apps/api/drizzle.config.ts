import { defineConfig } from 'drizzle-kit';

// Migrations geradas em ./drizzle a partir do schema em TS (fonte de verdade).
// A URL só é necessária para `push`/`migrate`, não para `generate`.
export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://g3:g3@localhost:5432/g3',
  },
  casing: 'snake_case',
});
