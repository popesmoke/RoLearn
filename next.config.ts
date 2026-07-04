import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Standalone output is for Docker/Railway only — set DOCKER_BUILD=1 there.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
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

initOpenNextCloudflareForDev();
