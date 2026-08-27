import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
};

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required for server-side database access.");
  return value;
}

const pool = globalForPrisma.prismaPool ?? new Pool({
  connectionString: getDatabaseUrl(),
  // Vercel can create many concurrent runtime instances. Keep each instance to one
  // short-lived database connection; Supabase's transaction pooler handles sharing.
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle: true,
});
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Reuse both the client and pool during hot reloads and warm serverless invocations.
globalForPrisma.prisma = prisma;
globalForPrisma.prismaPool = pool;
