/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static site generation for zero-cost hosting
  output: 'export',
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },

  // Configure security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com https://cdn.emailjs.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://www.google-analytics.com https://api.emailjs.com https://vitals.vercel-insights.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Optimize for production
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Configure redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    SITE_NAME: 'BorderlessBits',
    SITE_URL:
      process.env.NODE_ENV === 'production'
        ? 'https://borderlessbits.com'
        : 'http://localhost:3000',
  },

  // Experimental features (disabled for compatibility)
  // experimental: {
  //   optimizeCss: true,
  // }
};

// Bundle analyzer configuration for performance monitoring
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
