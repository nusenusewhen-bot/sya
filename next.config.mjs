/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic stable configuration — no experimental flags needed
  reactStrictMode: true,
  swcMinify: true,

  // Enable if you need images from external domains (Discord avatars, etc.)
  images: {
    domains: ['cdn.discordapp.com', 'images-ext-1.discordapp.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'images-ext-*.discordapp.net',
      },
    ],
  },

  // Optional: if you want better logging in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
