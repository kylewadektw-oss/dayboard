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
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile images
  },
}

module.exports = nextConfig
