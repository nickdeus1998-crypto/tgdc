/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.tgdc.go.tz', 'images.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;