/** @type {import('next').NextConfig} */
const nextConfig = {
  // expose your API URL  to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  },
  
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '**',
      },
    ],
  },
  // Compression optimisée
  compress: true,
  // Options pour améliorer les performances
  experimental: {
    // Nouvelles options expérimentales pour Next.js
    largePageDataBytes: 128 * 1000, // Augmente la limite pour les données de page
  },
  // Optimisation des headers pour performance et sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Ignorer les warnings liés aux attributs supplémentaires dans le DOM
  reactStrictMode: true,
  // Add this to help with hydration issues
  compiler: {
    // Enables the styled-components SWC transform if you're using styled-components
    styledComponents: true,
  },
};

module.exports = nextConfig;
