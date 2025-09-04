/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    AUDIT_API_URL: process.env.AUDIT_API_URL || 'http://localhost:8000',
  },
  // Removed rewrites - using API routes instead
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Static export for hosting on static hosts
  ...(process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
