import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@neondatabase/serverless", "ws", "@prisma/adapter-neon"],
};

export default nextConfig;
