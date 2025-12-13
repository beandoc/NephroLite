
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Acknowledge that an internal dependency of Genkit uses a deprecated Node.js feature.
    // This is a known issue with the `handlebars` package and is safe to ignore.
    config.resolve.alias = {
      ...config.resolve.alias,
      'handlebars': 'handlebars/dist/handlebars.js',
    }

    // The OpenTelemetry SDK (a dependency of Genkit) may try to dynamically require
    // the 'jaeger' exporter, which we don't use. This prevents a build warning.
    if (!isServer) {
      config.plugins.push(
        new (require('webpack').IgnorePlugin)({
          resourceRegExp: /@opentelemetry\/exporter-jaeger/,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
