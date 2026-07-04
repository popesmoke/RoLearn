import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

function deriveUsername(user) {
  if (user.robloxUsername) return user.robloxUsername.toLowerCase();
  if (user.email.includes("@rolearn.app")) return `user-${user.id.slice(0, 8)}`;
  const local = user.email.split("@")[0]?.replace(/[^a-z0-9_]/gi, "") ?? "";
  return (local || `user-${user.id.slice(0, 8)}`).toLowerCase();
}

async function main() {
  const users = await prisma.user.findMany({ where: { username: null } });

  for (const user of users) {
    let candidate = deriveUsername(user);
    let suffix = 1;

    while (await prisma.user.findUnique({ where: { username: candidate } })) {
      candidate = `${deriveUsername(user)}${suffix}`;
      suffix += 1;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username: candidate },
    });

    console.log(`Backfilled ${user.email} -> ${candidate}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
