import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sciolyguide/codebusters"],
  serverExternalPackages: ["@libsql/client"],
  poweredByHeader: false,
};

export default nextConfig;
