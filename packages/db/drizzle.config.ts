import { defineConfig } from 'drizzle-kit';
// import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// config({ path: fileURLToPath(new URL('.env.local', import.meta.url)) });
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL for drizzle config');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
