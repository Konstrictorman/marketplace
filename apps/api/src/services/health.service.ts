import { prisma } from "@marketplace/database";

export async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
