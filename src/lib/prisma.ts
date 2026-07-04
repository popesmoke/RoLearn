import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    process.env.NODE_ENV === "production" &&
    !databaseUrl.startsWith("prisma://") &&
    !databaseUrl.startsWith("prisma+")
  ) {
    throw new Error(
      "Cloudflare Workers require Prisma Accelerate. Set DATABASE_URL to prisma://... — see docs/HOSTING.md",
    );
  }

  return new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
