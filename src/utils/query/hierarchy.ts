// src/utils/query/hierarchy.ts
/**
 * Hierarchy Utilities - FULLY LAZY
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { RelationshipGraph } from './types';
import { getEntryKey } from './types';

// ❌ NO module-level imports

export async function getParent<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T> | null> {
  // ✅ Lazy import
  const { getOrBuildGraph } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entryKey = getEntryKey(entry as any);
  
  const parents = g.indexes.byParent.get(entryKey);
  if (!parents || parents.length === 0) return null;
  
  const parentEntry = g.nodes.get(parents[0]);
  return parentEntry as CollectionEntry<T> || null;
}

export async function getChildren<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entryKey = getEntryKey(entry as any);
  
  const children: CollectionEntry<T>[] = [];
  
  for (const [childKey, parents] of g.indexes.byParent) {
    if (parents.includes(entryKey)) {
      const childEntry = g.nodes.get(childKey);
      if (childEntry) {
        children.push(childEntry as CollectionEntry<T>);
      }
    }
  }
  
  return children;
}

export async function getAncestors<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  const ancestors: CollectionEntry<T>[] = [];
  let current = await getParent(entry, graph);
  
  while (current) {
    ancestors.push(current);
    current = await getParent(current, graph);
  }
  
  return ancestors;
}

export async function getDescendants<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const descendants: CollectionEntry<T>[] = [];
  const queue = [entry];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await getChildren(current, g);
    
    descendants.push(...children);
    queue.push(...children);
  }
  
  return descendants;
}

export async function getSiblings<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  const parent = await getParent(entry, graph);
  if (!parent) return [];
  
  const siblings = await getChildren(parent, graph);
  const entryKey = getEntryKey(entry as any);
  
  return siblings.filter(s => getEntryKey(s as any) !== entryKey);
}

export async function getRoots<T extends CollectionKey>(
  collection: T,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph, getCollectionEntries } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entries = getCollectionEntries(g, collection);
  
  return entries.filter(entry => {
    const entryKey = getEntryKey(entry as any);
    const parents = g.indexes.byParent.get(entryKey);
    return !parents || parents.length === 0;
  }) as CollectionEntry<T>[];
}

export async function getLeaves<T extends CollectionKey>(
  collection: T,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  // ✅ Lazy import
  const { getOrBuildGraph, getCollectionEntries } = await import('./graph');
  
  const g = graph || await getOrBuildGraph();
  const entries = getCollectionEntries(g, collection);
  
  const leaves: CollectionEntry<T>[] = [];
  
  for (const entry of entries) {
    const children = await getChildren(entry as any, g);
    if (children.length === 0) {
      leaves.push(entry as CollectionEntry<T>);
    }
  }
  
  return leaves;
}

export interface TreeNode<T extends CollectionKey> {
  entry: CollectionEntry<T>;
  children: TreeNode<T>[];
  depth: number;
}

export async function getTree<T extends CollectionKey>(
  collection: T,
  graph?: RelationshipGraph
): Promise<TreeNode<T>[]> {
  const roots = await getRoots(collection, graph);
  
  async function buildNode(
    entry: CollectionEntry<T>,
    depth: number
  ): Promise<TreeNode<T>> {
    const children = await getChildren(entry, graph);
    const childNodes = await Promise.all(
      children.map(child => buildNode(child as CollectionEntry<T>, depth + 1))
    );
    
    return {
      entry,
      children: childNodes,
      depth,
    };
  }
  
  return Promise.all(roots.map(root => buildNode(root, 0)));
}

export async function getBreadcrumbs<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<CollectionEntry<T>[]> {
  const ancestors = await getAncestors(entry, graph);
  return [...ancestors.reverse(), entry];
}

export async function isAncestorOf<T extends CollectionKey>(
  ancestor: CollectionEntry<T>,
  descendant: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<boolean> {
  const ancestors = await getAncestors(descendant, graph);
  const ancestorKey = getEntryKey(ancestor as any);
  return ancestors.some(a => getEntryKey(a as any) === ancestorKey);
}

export async function isDescendantOf<T extends CollectionKey>(
  descendant: CollectionEntry<T>,
  ancestor: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<boolean> {
  return isAncestorOf(ancestor, descendant, graph);
}

export async function getLevel<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  graph?: RelationshipGraph
): Promise<number> {
  const ancestors = await getAncestors(entry, graph);
  return ancestors.length;
}