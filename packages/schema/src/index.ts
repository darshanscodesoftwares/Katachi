export * from './util'
export * from './style'
export * from './behavior'
export * from './tokens'
export * from './background'
export * from './document'
export * from './defaults'

// Re-exported so @katachi/renderer can define per-section/block props schemas
// while importing only react + this package (renderer purity, CLAUDE.md §2.1).
export { z } from 'zod'
