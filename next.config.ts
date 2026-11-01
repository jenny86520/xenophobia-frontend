import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone for the Docker image (see Dockerfile).
  output: "standalone",
  // Set per build by deploy/scripts/update.sh: after an update, pages opened on the old build reload
  // instead of failing to find old chunks or Server Actions. Unset (local builds) means no skew protection.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || undefined,
};

export default nextConfig;
