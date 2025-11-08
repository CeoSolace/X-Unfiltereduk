// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'stripe', 'cloudinary'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [{ source: '/@:username', destination: '/:username' }];
  },
  env: {
    RENDER_PUBLIC_URL: process.env.RENDER_PUBLIC_URL,
  },
};

module.exports = nextConfig;
