import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nx-mono-repo-deployment-test/shared'],
};

export default nextConfig;

