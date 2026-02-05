import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT_MODE === "export" ? "export" : "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
