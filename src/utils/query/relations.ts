// src/utils/query/relations.ts
/**
 * Relation Resolution - FULLY LAZY
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { RelationshipGraph, EntryReference } from './types';
import { getEntryKey } from './types';

// ❌ NO module-level imports that touch astro:content

export async function getRelations<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  options: {
    graph?: RelationshipGraph;
    fields?: string[];
    maxDepth?: number;
  } = {}
): Promise<Map<string, CollectionEntry<CollectionKey>[]>> {
  // ✅ Lazy imports
  const { getOrBuildGraph, getRelationMap } = await import('./graph');
  
  const { fields, maxDepth = 1 } = options;
  const graph = options.graph || await getOrBuildGraph();
  
  const entryKey = getEntryKey(entry as any);
  const relations = getRelationMap(graph, entryKey);
  
  const result = new Map<string, CollectionEntry<CollectionKey>[]>();
  
  for (const relation of relations) {
    if (fields && !fields.includes(relation.field)) continue;
    
    const target = graph.nodes.get(relation.targetKey);
    if (target) {
      if (!result.has(relation.field)) {
        result.set(relation.field, []);
      }
      result.get(relation.field)!.push(target);
    }
  }
  
  return result;
}

export async function getReferencedEntries<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  field: string,
  graph?: RelationshipGraph
): Promise<CollectionEntry<CollectionKey>[]> {
  const relations = await getRelations(entry, { graph, fields: [field] });
  return relations.get(field) || [];
}

export async function getReferencingEntries<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<CollectionKey>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entryKey = getEntryKey(entry as any);
  
  const referencing: CollectionEntry<CollectionKey>[] = [];
  
  for (const [key, relations] of g.indexes.byReference) {
    for (const relation of relations) {
      if (relation.targetKey === entryKey) {
        const referencingEntry = g.nodes.get(key);
        if (referencingEntry) {
          referencing.push(referencingEntry);
        }
      }
    }
  }
  
  return referencing;
}

export async function getAllRelatedEntries<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  maxDepth: number = 3,
  graph?: RelationshipGraph
): Promise<CollectionEntry<CollectionKey>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph, getRelationMap } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entryKey = getEntryKey(entry as any);
  
  const visited = new Set<string>([entryKey]);
  const queue: Array<{ key: string; depth: number }> = [{ key: entryKey, depth: 0 }];
  const related: CollectionEntry<CollectionKey>[] = [];
  
  while (queue.length > 0) {
    const { key, depth } = queue.shift()!;
    
    if (depth >= maxDepth) continue;
    
    const relations = getRelationMap(g, key);
    
    for (const relation of relations) {
      if (visited.has(relation.targetKey)) continue;
      
      visited.add(relation.targetKey);
      const target = g.nodes.get(relation.targetKey);
      
      if (target) {
        related.push(target);
        queue.push({ key: relation.targetKey, depth: depth + 1 });
      }
    }
  }
  
  return related;
}

export async function resolveRelations<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  fields: string[],
  graph?: RelationshipGraph
): Promise<CollectionEntry<T> & { [key: string]: any }> {
  const relations = await getRelations(entry, { graph, fields });
  
  const resolved: any = { ...entry };
  
  for (const [field, entries] of relations) {
    resolved.data = {
      ...resolved.data,
      [field]: entries.length === 1 ? entries[0] : entries,
    };
  }
  
  return resolved;
}