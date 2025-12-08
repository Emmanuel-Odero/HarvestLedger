import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Move serverComponentsExternalPackages to top level for Next.js 16
  serverExternalPackages: ["@meshsdk/core"],
  // Empty turbopack config to silence the warning
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Enable async WebAssembly support for client-side
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };

      // Add rule for WASM files
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });
    }

    // Configure module resolution fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    return config;
  },
};

export default nextConfig;
