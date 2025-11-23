/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13+ 默认启用 App Router，无需 experimental.appDir
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig