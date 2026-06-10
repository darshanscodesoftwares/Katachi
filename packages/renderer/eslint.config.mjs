import tseslint from 'typescript-eslint'

// Renderer purity (CLAUDE.md §2.1): this package may import only react,
// @katachi/schema, and its own files/styles. No Next.js, no fetch, no
// database clients, no env access, no Node builtins.
const PURITY = 'Renderer purity (CLAUDE.md §2.1): only react and @katachi/schema may be imported.'

export default tseslint.config({
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'zod', message: `${PURITY} Import z from @katachi/schema instead.` },
        ],
        patterns: [
          { group: ['next', 'next/*', 'next/**'], message: `${PURITY} No Next.js imports.` },
          {
            group: [
              '@supabase/**',
              '@prisma/**',
              'prisma',
              'prisma/**',
              'zustand',
              'zustand/**',
              'zundo',
              '@tiptap/**',
              '@dnd-kit/**',
              'framer-motion',
              'motion',
              'motion/**',
              'sharp',
            ],
            message: `${PURITY} App-shell dependencies stay in apps/web.`,
          },
          {
            group: ['node:*', 'fs', 'path', 'os', 'crypto', 'http', 'https', 'child_process'],
            message: `${PURITY} No Node builtins — the renderer must run anywhere.`,
          },
        ],
      },
    ],
    'no-restricted-globals': [
      'error',
      { name: 'fetch', message: 'Renderer purity (§2.1): no fetch. Data arrives as props.' },
      { name: 'process', message: 'Renderer purity (§2.1): no environment variables.' },
    ],
  },
})
