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
      ...(process.env.NEXT_PUBLIC_API_BASE_URL
        ? (() => {
            const url = new URL(process.env.NEXT_PUBLIC_API_BASE_URL as string);
            return [
              {
                protocol: url.protocol.replace(':', ''),
                hostname: url.hostname,
                port: url.port,
                pathname: '/**',
              },
            ];
          })()
        : []),
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
