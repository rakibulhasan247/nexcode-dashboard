import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin tracing to this project so a stray lockfile in a parent folder isn't picked up.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
