import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import checkFile from 'eslint-plugin-check-file'
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'check-file': checkFile,
      perfectionist,
    },
    rules: {
      // Filename and folder naming conventions
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/components/**/': 'KEBAB_CASE',
          'src/hooks/**/': 'KEBAB_CASE',
          'src/lib/**/': 'KEBAB_CASE',
          'src/data/**/': 'KEBAB_CASE',
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
