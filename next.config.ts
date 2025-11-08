import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'stripe', 'cloudinary'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    RENDER_PUBLIC_URL: process.env.RENDER_PUBLIC_URL,
  },
};

export default nextConfig;
