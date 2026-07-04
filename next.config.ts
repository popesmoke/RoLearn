import type { NextConfig } from "next";

const isStandalone =
  process.env.DOCKER_BUILD === "1" || process.env.PRISMA_COMPUTE === "1";

const nextConfig: NextConfig = {
  ...(isStandalone ? { output: "standalone" as const } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tr.rbxcdn.com" },
      { protocol: "https", hostname: "www.roblox.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "cdn.putput.io" },
    ],
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development" && process.env.PRISMA_COMPUTE !== "1") {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
