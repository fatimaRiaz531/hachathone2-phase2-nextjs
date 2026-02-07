/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    domains: ['localhost', '0.0.0.0'],
  },
}

module.exports = nextConfig