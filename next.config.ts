import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  ...(isProduction ? { output: 'export' as const } : {}),
  // GitHub Pages에서 하위 경로를 직접 새로고침할 수 있도록 index.html을 생성합니다.
  ...(isProduction ? { trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
