import { defineComputeConfig } from "@prisma/compute-sdk/config";

const buildCommand =
  process.platform === "win32"
    ? "cmd /c scripts\\build-compute.cmd"
    : "node scripts/build-compute.mjs";

export default defineComputeConfig({
  app: {
    name: "rocreators",
    framework: "nextjs",
    build: {
      command: buildCommand,
    },
  },
});
