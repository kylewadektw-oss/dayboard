/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Auto-detect site URL for deployments
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                         process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  },
  images: {
    domains: [], // Removed Google OAuth profile images domain
  },
  // async headers() {
  //   // CSP completely disabled for OAuth debugging
  //   return [];
  // }
}

module.exports = nextConfig
