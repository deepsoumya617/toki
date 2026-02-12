import type { NextConfig } from 'next';
import { webEnv } from '@xd/env/web';

void webEnv;

const nextConfig: NextConfig = {
  transpilePackages: ['@xd/env'],
  devIndicators: false,
};

export default nextConfig;
