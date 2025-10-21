/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
<<<<<<< HEAD
    domains: [
      'cloud.appwrite.io',
      'nyc.cloud.appwrite.io',
      'images.unsplash.com',
      'i.imgur.com',
      'imgur.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'i.pinimg.com',
      'jollibee.com'
    ],
=======
>>>>>>> origin/main
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'lon.cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: '**.cloud.appwrite.io',
      },
    ],
  },
}

module.exports = nextConfig
