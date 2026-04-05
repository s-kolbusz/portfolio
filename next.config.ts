import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactCompiler: true,
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
