// src/utils/query/graph.ts
/**
 * Relationship Graph Builder - FULLY LAZY
 * NO astro:content imports at module level
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { 
  RelationshipGraph, 
  RelationMap, 
  Relation,
  GraphBuildOptions,
} from './types';
import { getEntryKey, parseEntryKey } from './types';

// ❌ NO OTHER IMPORTS FROM FILES THAT MIGHT TOUCH astro:content
// ✅ Import inside functions only

let graphCache: RelationshipGraph | null = null;

export async function getOrBuildGraph(
  options: GraphBuildOptions = {}
): Promise<RelationshipGraph> {
  if (options.cache !== false && graphCache) {
    return graphCache;
  }
  
  const graph = await buildRelationshipGraph(options);
  
  if (options.cache !== false) {
    graphCache = graph;
  }
  
  return graph;
}

export function clearGraphCache(): void {
  graphCache = null;
}

export async function buildRelationshipGraph(
  options: GraphBuildOptions = {}
): Promise<RelationshipGraph> {
  // ✅ Lazy import EVERYTHING
  const { getCollection } = await import('astro:content');
  const { extractRelationConfig, normalizeReference, isParentField } = await import('./schema');
  
  // Get collection names without importing collections utilities
  const { collections } = await import('@/content/config');
  const allCollections = Object.keys(collections).filter(
    c => c !== 'menus' && c !== 'menu-items'
  ) as CollectionKey[];
  
  const {
    collections: requestedCollections = allCollections,
    includeIndirect = false,
    maxIndirectDepth = 3,
  } = options;
  
  const graph: RelationshipGraph = {
    nodes: new Map(),
    indexes: {
      byCollection: new Map(),
      byParent: new Map(),
      byReference: new Map(),
    },
    collections: requestedCollections as CollectionKey[],
    totalEntries: 0,
  };
  
  // Load entries
  for (const collection of requestedCollections) {
    const entries = await getCollection(collection as any);
    
    for (const entry of entries) {
      const key = getEntryKey(entry as any);
      graph.nodes.set(key, entry as any);
      
      if (!graph.indexes.byCollection.has(collection)) {
        graph.indexes.byCollection.set(collection, []);
      }
      graph.indexes.byCollection.get(collection)!.push(key);
      
      graph.totalEntries++;
    }
  }
  
  // Build relationships
  for (const [key, entry] of graph.nodes) {
    const data = entry.data as Record<string, any>;
    const configs = extractRelationConfig(data);
    
    for (const config of configs) {
      if (isParentField(config.field)) continue;
      
      const refs = normalizeReference(data[config.field]);
      
      for (const ref of refs) {
        const targetKey = getEntryKey(ref as any);
        
        if (!graph.indexes.byReference.has(key)) {
          graph.indexes.byReference.set(key, []);
        }
        graph.indexes.byReference.get(key)!.push({
          type: 'reference',
          field: config.field,
          targetKey,
          targetCollection: ref.collection as CollectionKey,
        });
      }
    }
    
    // Handle parent relationships
    if (data.parent) {
      const parents = normalizeReference(data.parent);
      
      for (const parent of parents) {
        const parentKey = getEntryKey(parent as any);
        
        if (!graph.indexes.byParent.has(key)) {
          graph.indexes.byParent.set(key, []);
        }
        graph.indexes.byParent.get(key)!.push(parentKey);
        
        if (!graph.indexes.byReference.has(key)) {
          graph.indexes.byReference.set(key, []);
        }
        graph.indexes.byReference.get(key)!.push({
          type: 'parent',
          field: 'parent',
          targetKey: parentKey,
          targetCollection: parent.collection as CollectionKey,
        });
      }
    }
  }
  
  return graph;
}

export function getCollectionEntries(
  graph: RelationshipGraph,
  collection: CollectionKey
): CollectionEntry<typeof collection>[] {
  const keys = graph.indexes.byCollection.get(collection) || [];
  return keys
    .map(key => graph.nodes.get(key))
    .filter((e): e is CollectionEntry<typeof collection> => e !== undefined);
}

export function getRelationMap(
  graph: RelationshipGraph,
  entryKey: string
): RelationMap {
  return graph.indexes.byReference.get(entryKey) || [];
}