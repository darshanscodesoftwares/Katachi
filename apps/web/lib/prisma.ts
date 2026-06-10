import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * Lazy singleton: nothing connects (or throws) at import time, so builds and
 * pages work with no DATABASE_URL — callers check hasDatabaseEnv() first or
 * catch and render the setup notice.
 */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy apps/web/.env.example to .env.local (CLAUDE.md §16).')
  }

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })
  globalForPrisma.prisma = prisma
  return prisma
}
