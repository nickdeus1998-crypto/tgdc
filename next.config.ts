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
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net translate.google.com translate.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com https://cdnjs.cloudflare.com translate.googleapis.com; font-src 'self' fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' https://*.tile.openstreetmap.org https://images.unsplash.com data: translate.google.com www.gstatic.com; connect-src 'self' translate.googleapis.com; frame-src 'self' translate.google.com;" 
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;