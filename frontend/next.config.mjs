/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Vercel deployment, export for Docker
  output: process.env.DOCKER_BUILD === 'true' ? 'export' : 'standalone',
  
  // Keep trailing slash for static export compatibility
  trailingSlash: true,
  
  // Image optimization settings
  images: {
    unoptimized: process.env.DOCKER_BUILD === 'true'
  },
  
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['@hashgraph/sdk']
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  },
  
  // Rewrites for API proxy (only for Vercel deployment)
  async rewrites() {
    // Only apply rewrites when not building for Docker
    if (process.env.DOCKER_BUILD !== 'true') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: `${process.env.BACKEND_URL || 'https://your-backend.com'}/:path*`
        }
      ]
    }
    return []
  }
}

export default nextConfig