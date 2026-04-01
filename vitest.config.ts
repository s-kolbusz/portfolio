import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        // GSAP animation components — side-effects only, no testable branches in jsdom
        'src/components/ui/dock-tooltip.tsx',
        'src/components/ui/custom-cursor.tsx',
        'src/components/ui/smooth-scroller.tsx',
        // Non-JS assets, type declarations, and entry points that export no logic
        'src/**/*.d.ts',
        'src/styles/**',
        'src/i18n/messages/**',
      ],
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
})
