import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 경고가 있어도 배포 실패하지 않음
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 에러가 있어도 배포 실패하지 않음
    ignoreBuildErrors: true,
  },
};

export default nextConfig;