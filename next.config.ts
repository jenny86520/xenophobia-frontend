import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone for the Docker image (see Dockerfile).
  output: "standalone",
};

export default nextConfig;
