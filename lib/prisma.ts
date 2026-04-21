import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
