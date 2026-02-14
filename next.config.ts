import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
