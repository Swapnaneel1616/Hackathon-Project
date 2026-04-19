import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/app/:path*", destination: "/user/:path*", permanent: false },
      { source: "/login", destination: "/user/login", permanent: false },
    ];
  },
};

export default nextConfig;
