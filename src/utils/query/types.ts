// src/utils/query/types.ts
/**
 * Core Type Definitions for the Query System
 * 
 * Provides type-safe interfaces for the entire querying system.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';

/**
 * Relationship types in the system
 */
export type RelationType = 
  | 'reference'      // Direct reference (A → B)
  | 'referenced-by'  // Reverse reference (B ← A)
  | 'parent'         // Hierarchical parent
  | 'child'          // Hierarchical child
  | 'sibling'        // Same parent
  | 'ancestor'       // Any level up
  | 'descendant'     // Any level down
  | 'indirect';      // Multi-hop relation (A → B → C)

/**
 * A single relationship between two entries
 */
export interface Relation {
  type: RelationType;
  field?: string;           // Which field contains the reference
  targetKey: string;        // Full key of target entry
  targetCollection: CollectionKey;
  depth?: number;           // For indirect relations
  path?: string[];          // Path of collections for indirect relations
}

/**
 * Complete relationship map for an entry
 */
export type RelationMap = Relation[];

/**
 * Query filter function
 */
export type FilterFn<T extends CollectionKey = CollectionKey> = (
  entry: CollectionEntry<T>
) => boolean;

/**
 * Query sort function
 */
export type SortFn<T extends CollectionKey = CollectionKey> = (
  a: CollectionEntry<T>,
  b: CollectionEntry<T>
) => number;

/**
 * Query options
 */
export interface QueryOptions<T extends CollectionKey = CollectionKey> {
  collection?: T | T[];
  filter?: FilterFn<T> | FilterFn<T>[];
  sort?: SortFn<T> | SortFn<T>[] | SortConfig[];
  limit?: number;
  offset?: number;
  includeRelations?: boolean;
  maxDepth?: number;              // For indirect relations
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  nullsFirst?: boolean;
}

/**
 * Query result with metadata
 */
export interface QueryResult<T extends CollectionKey = CollectionKey> {
  entries: CollectionEntry<T>[];
  total: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  relations?: Map<string, RelationMap>;
}

/**
 * Relationship graph for the entire system
 */
export interface RelationshipGraph {
  // All entries by key
  nodes: Map<string, CollectionEntry<CollectionKey>>;
  
  // Quick lookup indexes
  indexes: {
    byCollection: Map<CollectionKey, string[]>;
    byParent: Map<string, string[]>;
    byReference: Map<string, RelationMap>;
  };
  
  // Metadata
  collections: CollectionKey[];
  totalEntries: number;
}

/**
 * Graph build options
 */
export interface GraphBuildOptions {
  collections?: CollectionKey[];
  includeIndirect?: boolean;
  maxIndirectDepth?: number;
  cache?: boolean;
}

/**
 * Helper type for entry reference
 */
export interface EntryReference {
  collection: CollectionKey;
  id: string;
}

/**
 * Helper to create unique entry key
 */
export function getEntryKey(entry: CollectionEntry<CollectionKey>): string;
export function getEntryKey(ref: EntryReference): string;
export function getEntryKey(collectionOrEntry: CollectionKey | CollectionEntry<CollectionKey>, id?: string): string;
export function getEntryKey(
  collectionOrEntry: CollectionKey | CollectionEntry<CollectionKey> | EntryReference,
  id?: string
): string {
  if (typeof collectionOrEntry === 'string') {
    // Called as getEntryKey(collection, id)
    return `${collectionOrEntry}:${id}`;
  } else if ('collection' in collectionOrEntry && 'id' in collectionOrEntry && !('data' in collectionOrEntry)) {
    // It's an EntryReference
    return `${collectionOrEntry.collection}:${collectionOrEntry.id}`;
  } else {
    // It's a CollectionEntry
    const entry = collectionOrEntry as CollectionEntry<CollectionKey>;
    return `${entry.collection}:${entry.id}`;
  }
}

/**
 * Helper to parse entry key
 */
export function parseEntryKey(key: string): EntryReference {
  const [collection, id] = key.split(':');
  return { collection: collection as CollectionKey, id };
}

/**
 * Type guard for collection reference
 */
export function isCollectionReference(value: any): value is EntryReference {
  return (
    value &&
    typeof value === 'object' &&
    'collection' in value &&
    'id' in value
  );
}