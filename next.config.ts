import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Enable aggressive caching for Vercel
  experimental: {
    staleTimes: {
      dynamic: 30,   // Cache dynamic pages for 30s on client
      static: 180,   // Cache static pages for 3min on client
    },
  },
};

export default nextConfig;
