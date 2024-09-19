/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.ifttt.com",
      },
    ],
  },
};

export default nextConfig;
