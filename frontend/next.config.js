/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      }
    ]
  },
  env: {
    // Assurez-vous que ces variables sont aussi définies dans Vercel
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  compress: true,
  experimental: { largePageDataBytes: 128*1000 },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',       value: 'DENY'  },
          { key: 'X-XSS-Protection',      value: '1; mode=block' },
        ],
      },
    ]
  },
  reactStrictMode: true,
  compiler: { styledComponents: true },
}

module.exports = nextConfig
