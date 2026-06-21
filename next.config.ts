import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Required for Vercel serverless deployment
  // Ensures Prisma client is bundled correctly
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
