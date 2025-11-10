// src/utils/query/query.ts
/**
 * Main Query Builder - FULLY LAZY
 * NO astro:content imports at module level
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { QueryOptions, QueryResult, FilterFn, SortFn, SortConfig } from './types';

// ❌ NO IMPORTS FROM OTHER QUERY FILES THAT MIGHT IMPORT astro:content
// ✅ All imports happen inside async functions

export class Query<T extends CollectionKey> {
  private _collection?: T | T[];
  private _filters: FilterFn<T>[] = [];
  private _sorts: Array<SortFn<T> | SortConfig> = [];
  private _limit?: number;
  private _offset: number = 0;
  private _includeRelations: boolean = false;
  private _maxDepth: number = 3;
  
  constructor(collection?: T | T[]) {
    this._collection = collection;
  }
  
  from(collection: T | T[]): this {
    this._collection = collection;
    return this;
  }
  
  where(filter: FilterFn<T>): this {
    this._filters.push(filter);
    return this;
  }
  
  whereAll(...filters: FilterFn<T>[]): this {
    this._filters.push(...filters);
    return this;
  }
  
  orderBy(sort: SortFn<T> | SortConfig): this {
    this._sorts.push(sort);
    return this;
  }
  
  limit(limit: number): this {
    this._limit = limit;
    return this;
  }
  
  offset(offset: number): this {
    this._offset = offset;
    return this;
  }
  
  withRelations(include: boolean = true, maxDepth?: number): this {
    this._includeRelations = include;
    if (maxDepth !== undefined) {
      this._maxDepth = maxDepth;
    }
    return this;
  }
  
  /**
   * Execute query - ALL imports happen here
   */
  async get(): Promise<QueryResult<T>> {
    // ✅ Lazy import everything
    const { getCollection } = await import('astro:content');
    
    if (!this._collection) {
      throw new Error('Query must specify collection(s)');
    }
    
    const collections = Array.isArray(this._collection) 
      ? this._collection 
      : [this._collection];
    
    let entries: CollectionEntry<T>[] = [];
    
    if (this._includeRelations) {
      // ✅ Lazy import graph utilities
      const { getOrBuildGraph } = await import('./graph');
      const { getCollectionEntries } = await import('./graph');
      
      const graph = await getOrBuildGraph({ collections: collections as CollectionKey[] });
      
      for (const coll of collections) {
        const collEntries = getCollectionEntries(graph, coll as CollectionKey);
        entries.push(...collEntries as CollectionEntry<T>[]);
      }
    } else {
      const results = await Promise.all(
        collections.map(c => getCollection(c as any))
      );
      entries = results.flat() as CollectionEntry<T>[];
    }
    
    // ✅ Lazy import filter/sort utilities
    const { applyFilters } = await import('./filters');
    const { applySorting } = await import('./sorting');
    
    entries = applyFilters(entries, this._filters);
    entries = applySorting(entries, this._sorts);
    
    if (this._offset > 0) {
      entries = entries.slice(this._offset);
    }
    if (this._limit !== undefined) {
      entries = entries.slice(0, this._limit);
    }
    
    return {
      entries,
      total: entries.length,
    };
  }
  
  getCollectionName(): T | T[] | null {
    return this._collection ?? null;
  }
}

export function query<T extends CollectionKey>(collection?: T | T[]): Query<T> {
  return new Query(collection);
}

export async function find<T extends CollectionKey>(
  collection: T,
  slug: string
): Promise<CollectionEntry<T> | undefined> {
  const result = await query(collection)
    .where(entry => {
      const entrySlug = 'slug' in entry ? entry.slug : entry.id;
      return entrySlug === slug;
    })
    .get();
  
  return result.entries[0];
}

export async function findWhere<T extends CollectionKey>(
  collection: T,
  filter: FilterFn<T>
): Promise<CollectionEntry<T> | undefined> {
  const result = await query(collection).where(filter).limit(1).get();
  return result.entries[0];
}

export async function findAll<T extends CollectionKey>(
  collection: T,
  filter?: FilterFn<T>
): Promise<CollectionEntry<T>[]> {
  const q = query(collection);
  if (filter) q.where(filter);
  const result = await q.get();
  return result.entries;
}