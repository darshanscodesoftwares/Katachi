import { defineConfig } from 'prisma/config'
import { config as loadEnv } from 'dotenv'

// Prisma CLI does not read .env.local on its own; Next.js does. Load it here
// so `prisma migrate deploy` / `prisma studio` work once Supabase env arrives.
loadEnv({ path: '.env.local', quiet: true })

// DIRECT_URL (non-pooled) is preferred for migrations; fall back to the pooled
// DATABASE_URL. Omitted entirely while env vars are absent so offline commands
// (generate, migrate diff) keep working without a live database.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  ...(url ? { datasource: { url } } : {}),
})
