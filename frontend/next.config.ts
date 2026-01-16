import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * ======================
 * 
 * IMAGE DOMAINS:
 * We need to allow Amazon's image CDN to load product images.
 * Without this, Next.js's Image component will block external images.
 */

const nextConfig: NextConfig = {
  images: {
    // Allow images from Amazon's CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Environment variables available in the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

export default nextConfig;
