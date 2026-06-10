import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Workspace packages ship raw TypeScript; Next transpiles them.
  transpilePackages: ['@katachi/schema', '@katachi/renderer'],
}

export default nextConfig
