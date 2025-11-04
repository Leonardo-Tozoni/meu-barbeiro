/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'utfs.io'
      },
      {
        hostname: 'bp72chbkwc.ufs.sh'
      }
    ]
  }
};

export default nextConfig;
