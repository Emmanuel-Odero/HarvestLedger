/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for Netlify deployment
  output: process.env.NODE_ENV === 'production' ? 'export' : 'standalone',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  experimental: {
    serverComponentsExternalPackages: ['@hashgraph/sdk']
  },
  
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  },
  
  // Only use rewrites in development (not supported in static export)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/:path*`,
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig