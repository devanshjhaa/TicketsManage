/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Handle image optimization for Amplify
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment-aware configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
