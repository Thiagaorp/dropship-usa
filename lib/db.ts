import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrisma(): PrismaClient {
  // Support multiple Neon variable naming conventions:
  // - DATABASE_URL          (manual setup / older Neon integration)
  // - POSTGRES_URL          (newer Neon/Vercel integration)
  // - POSTGRES_PRISMA_URL   (Neon Vercel integration with pgbouncer params)
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    "";

  // Local development: use SQLite via LibSQL
  if (!url || url.startsWith("file:")) {
    const localUrl = url || "file:dev.db";
    const adapter = new PrismaLibSql({ url: localUrl });
    return new PrismaClient({ adapter } as never);
  }

  // Turso (libsql://)
  if (url.startsWith("libsql://")) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({ adapter } as never);
  }

  // Neon PostgreSQL (postgres:// or postgresql://)
  const { neonConfig, Pool } = require("@neondatabase/serverless");
  const { WebSocket } = require("ws");
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
