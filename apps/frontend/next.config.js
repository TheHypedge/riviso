/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@riviso/shared-types', '@riviso/ui-components'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.BACKEND_URL || 'http://localhost:4000/api',
  },
}

module.exports = nextConfig
