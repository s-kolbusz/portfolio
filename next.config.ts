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
