import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // Default connection string with URL-encoded password (@ becomes %40)
  const defaultUrl = "postgresql://postgres:MNSizone%40789@93.127.203.106:5432/voice_agent_db";
  const url = process.env.DATABASE_URL || defaultUrl;
  
  if (!url || url.trim() === "") {
    throw new Error("DATABASE_URL is required but was not provided");
  }
  
  // Ensure it's set in process.env for Prisma
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url;
  }
  
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

