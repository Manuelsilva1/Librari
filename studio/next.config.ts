import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The i18n object below is for the Pages Router and conflicts with
  // App Router's manual i18n setup using [lang] segments and middleware.
  // Removing it.
  // i18n: {
  //   locales: ['en', 'es'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
