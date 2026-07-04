import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

process.env.PRISMA_COMPUTE = "1";
process.env.PATH = `C:\\Program Files\\nodejs;${process.env.PATH ?? ""}`;

execSync(`"${node}" "${prismaCli}" generate`, {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});
execSync(`"${node}" "${nextCli}" build`, {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});
