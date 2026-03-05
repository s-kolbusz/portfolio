import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      // Import ordering: react → next → external → internal → styles
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^@/.*'],
          groups: [
            'react',
            'next',
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'style',
          ],
          customGroups: [
            { elementNamePattern: '^react$|^react-dom$', groupName: 'react' },
            { elementNamePattern: '^next$|^next/.*|^next-.*', groupName: 'next' },
          ],
        },
      ],
    },
  },
  // Override default ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
