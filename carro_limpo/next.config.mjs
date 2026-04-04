/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/lava_jato.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;