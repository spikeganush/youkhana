/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent-iad3-2.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'instagram.fsyd5-1.fna.fbcdn.net',
      },
    ],
  },
};

module.exports = nextConfig;
