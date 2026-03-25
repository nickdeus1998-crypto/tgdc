/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable X-Powered-By header to prevent technology fingerprinting
  poweredByHeader: false,
  images: {
    domains: ['www.tgdc.go.tz', 'images.unsplash.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Limit request body size to prevent memory exhaustion attacks
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
  // Treat nodemailer as external to suppress Turbopack build warning
  serverExternalPackages: ['nodemailer'],
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;