/** Recursive partial; arrays are kept whole (we never partially merge array elements). */
export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

/** Node ids for pages/sections/blocks/layers. Works in Node 19+, browsers, and edge runtimes. */
export function createId(): string {
  return crypto.randomUUID()
}
