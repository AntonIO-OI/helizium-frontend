import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: 'export',
  transpilePackages: [
    '@ionic/react',
    '@ionic/core',
    '@stencil/core',
    'ionicons',
  ],
  webpack: (config) => {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};

    return config;
  },
};

export default nextConfig;
