import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

import { externalProjectRedirects } from './src/data/project-redirects'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactCompiler: true,
  // the day of the build, shown in act 4 as the site's last change (how-i-work.tsx)
  env: { BUILD_DATE: new Date().toISOString().slice(0, 10) },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'gsap', 'lenis'],
  },
  allowedDevOrigins: ['192.168.1.35'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      // the redesign, at /v2/<locale> until it replaces the old site (not permanent: it will move)
      {
        source: '/v2',
        destination: '/v2/en',
        permanent: false,
      },
      ...externalProjectRedirects(),
    ]
  },
  async rewrites() {
    return [
      {
        source: '/:locale/sitemap.xml',
        destination: '/:locale/sitemap',
      },
    ]
  },
}

export default withNextIntl(nextConfig)
