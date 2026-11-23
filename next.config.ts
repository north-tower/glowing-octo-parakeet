import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  devIndicators: false,
  async redirects() {
    return [
      { source: "/landing.html", destination: "/", permanent: true },
      { source: "/index.html", destination: "/app", permanent: true },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
