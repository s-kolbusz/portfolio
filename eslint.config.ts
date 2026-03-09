import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import checkFile from 'eslint-plugin-check-file'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import perfectionist from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'check-file': checkFile,
      perfectionist,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      ...jsxA11y.configs.recommended.rules,

      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

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

      // Prefer named exports
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            'Prefer named exports. Default exports are only allowed in Next.js core files (page, layout, etc.) and configuration files.',
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
  {
    // Exceptions for Next.js core files and configuration files
    files: [
      'src/app/**/{page,layout,template,not-found,loading,error,global-error,robots,sitemap}.tsx',
      'src/app/**/{page,layout,template,not-found,loading,error,global-error,robots,sitemap,route}.ts',
      'src/i18n/request.ts',
      'src/proxy.ts',
      'next.config.ts',
      'eslint.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'postcss.config.mjs',
      'tailwind.config.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
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
