/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        // Vercel Blob permanent storage (AI-generated images)
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};
module.exports = nextConfig;
