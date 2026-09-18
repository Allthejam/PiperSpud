/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
