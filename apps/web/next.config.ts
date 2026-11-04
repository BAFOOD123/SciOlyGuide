import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sciolyguide/codebusters", "@sciolyguide/rocks-minerals"],
  serverExternalPackages: ["@libsql/client"],
  poweredByHeader: false,
};

export default nextConfig;
