import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
  transpilePackages: [
    '@ionic/react',
    '@ionic/core',
    '@stencil/core',
    'ionicons',
  ],
};

export default nextConfig;
