/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const nextConfig = {
  // Temporarily disabling rewrites to use local Next.js mock API routes
  async rewrites() {
    return [
      // {
      //   source: '/api/backend/:path*',
      //   destination: `${backendUrl}/api/:path*`, // Proxy to Backend API Server
      // },
    ]
  },
}

export default nextConfig;
