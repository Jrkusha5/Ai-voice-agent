import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // Default connection string with URL-encoded password (@ becomes %40)
  // Default connection string with URL-encoded password (@ becomes %40)
  const defaultUrl = "postgresql://postgres:MNSizone%40789@93.127.203.106:5432/voice_agent_db";
  // Force the correct URL to debug env var issues
  const url = defaultUrl; // process.env.DATABASE_URL || defaultUrl;

  if (!url || url.trim() === "") {
    throw new Error("DATABASE_URL is required but was not provided");
  }

  // Ensure it's set in process.env for Prisma
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url;
  }

  // Mask password for logging
  const maskedUrl = url.replace(/:([^:@]+)@/, ":****@");
  console.log("Using Database URL:", maskedUrl);

  return url;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl();

  // Create PostgreSQL pool
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create PrismaClient with adapter
  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Database connection check
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Run connection check on startup
checkDatabaseConnection();

