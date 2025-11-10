// src/utils/query/schema.ts
/**
 * Schema Helpers for Relations
 * These functions BUILD schemas at config time, they don't ACCESS collections
 */

// ❌ This is the problem - module-level import
// import { z, reference } from 'astro:content';

// ✅ Import inside each function instead
import type { CollectionKey } from 'astro:content';

/**
 * Create a relation field schema for a collection
 */
export function relationSchema(targetCollection: CollectionKey | CollectionKey[]) {
  // ✅ Lazy import - only runs when building schema in config.ts
  const { z, reference } = require('astro:content');
  
  const collections = Array.isArray(targetCollection) ? targetCollection : [targetCollection];
  
  const singleRef = z.union(
    collections.map((coll: CollectionKey) => reference(coll)) as any
  );
  
  const arrayRef = z.array(singleRef);
  
  return z.union([singleRef, arrayRef]).optional();
}

export function parentSchema(collection: CollectionKey) {
  const { z, reference } = require('astro:content');
  
  return z.union([
    reference(collection),
    z.array(reference(collection))
  ]).optional();
}

export function createRelationalSchema(
  collection: CollectionKey,
  relations: Record<string, CollectionKey | CollectionKey[]>
) {
  const schema: Record<string, any> = {};
  
  schema.parent = parentSchema(collection);
  
  for (const [field, targetCollection] of Object.entries(relations)) {
    schema[field] = relationSchema(targetCollection);
  }
  
  return schema;
}

export interface RelationConfig {
  field: string;
  targetCollections: CollectionKey[];
  isArray: boolean;
}

/**
 * Extract relation configuration - RUNTIME function, no imports
 */
export function extractRelationConfig(
  data: Record<string, any>
): RelationConfig[] {
  const configs: RelationConfig[] = [];
  
  for (const [field, value] of Object.entries(data)) {
    if (!value) continue;
    
    if (isCollectionReference(value)) {
      configs.push({
        field,
        targetCollections: [value.collection],
        isArray: false,
      });
    } else if (Array.isArray(value) && value.every(isCollectionReference)) {
      const collections = [...new Set(value.map(v => v.collection))];
      configs.push({
        field,
        targetCollections: collections,
        isArray: true,
      });
    }
  }
  
  return configs;
}

/**
 * Normalize reference value to array - RUNTIME function, no imports
 */
export function normalizeReference(
  value: any
): Array<{ collection: CollectionKey; id: string }> {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(isCollectionReference);
  if (isCollectionReference(value)) return [value];
  return [];
}

/**
 * Check if a field is a parent field - RUNTIME function, no imports
 */
export function isParentField(field: string): boolean {
  return field === 'parent' || field === 'parentId' || field === 'parentRef';
}

/**
 * Type guard helper - RUNTIME function, no imports
 */
function isCollectionReference(value: any): value is { collection: CollectionKey; id: string } {
  return (
    value &&
    typeof value === 'object' &&
    'collection' in value &&
    'id' in value &&
    typeof value.collection === 'string' &&
    typeof value.id === 'string'
  );
}