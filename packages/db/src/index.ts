import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 *
 * In Next.js dev mode, modules are hot-reloaded on every file change, which
 * would normally create a brand-new PrismaClient (and a brand-new DB
 * connection pool) on every save — quickly exhausting Neon's connection
 * limit. Caching the instance on `globalThis` in non-production
 * environments avoids that.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
