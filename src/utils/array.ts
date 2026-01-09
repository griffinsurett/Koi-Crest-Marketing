// src/utils/array.ts
/**
 * Array utility functions
 */

/**
 * Normalize items prop to always be an array
 */
export function toArray<T>(items: T | T[] | undefined | null): T[] {
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}
