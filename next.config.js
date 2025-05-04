/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },  // Webpack configuration to handle node modules that require 'fs'
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on node modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'mock-aws-s3': false,
        aws: false,
        'aws-sdk': false
      };      // Add an exclude rule for the @mapbox/node-pre-gyp files
      config.module.rules.push({
        test: /node_modules\/@mapbox\/node-pre-gyp\/.*\.html$/,
        loader: 'ignore-loader',
      });
      
      // Exclude bcrypt from client bundle
      config.externals = [...(config.externals || []), 'bcrypt'];
    }
    return config;
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
