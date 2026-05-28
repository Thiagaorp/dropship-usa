import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling these packages.
  // They are loaded from node_modules at runtime only — never during build.
  serverExternalPackages: [
    "stripe",
    "@neondatabase/serverless",
    "ws",
    "@prisma/adapter-neon",
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],
};

export default nextConfig;
