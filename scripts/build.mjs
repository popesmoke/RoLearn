import { execSync } from "node:child_process";

execSync("npx prisma generate", { stdio: "inherit" });

const dbUrl = process.env.DATABASE_URL ?? "";
const isPlaceholder = dbUrl.includes("placeholder") || dbUrl.length < 20;

if (dbUrl && !isPlaceholder) {
  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
    execSync("node scripts/backfill-usernames.mjs", { stdio: "inherit" });
  } catch {
    console.warn("prisma db push failed — continuing build");
  }
}

execSync("npx next build", { stdio: "inherit" });
