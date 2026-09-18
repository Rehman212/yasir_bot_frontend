import type { NextConfig } from "next";

/** AWS Lightsail (or any) Nest API origin — used only by server-side rewrites. */
const BACKEND_URL = (
  process.env.BACKEND_URL || "http://13.206.223.212"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
