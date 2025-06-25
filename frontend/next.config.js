/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/avif','image/webp'],
    remotePatterns: [{
      protocol: 'https',
      hostname: 'image.tmdb.org',
      pathname: '**',
    }],
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
