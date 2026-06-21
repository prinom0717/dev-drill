import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error - Turbopack を無効化するための非公開オプション
    turbo: false,
  },
};

export default nextConfig;