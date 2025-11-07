// src/utils/collections/prepare.ts
/**
 * Collection Entry Preparation and Processing
 * 
 * This module handles transforming raw collection entries into "prepared" items
 * that are ready for use in pages and components. Preparation includes:
 * - Adding slug and URL fields
 * - Determining correct URL path (collection or root level)
 * - Rendering MDX content automatically (undefined for JSON entries)
 * - Adding content field with body text
 * 
 * References are NOT resolved here - components query for them as needed.
 */

import type { CollectionKey, CollectionEntry } from 'astro:content';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { MetaData, BaseData } from "@/content/schema";
import { getItemKey } from './core';
import { shouldItemHavePage, shouldItemUseRootPath } from '@/utils/pages';

/**
 * Fields added during the preparation process
 */
export interface PreparedFields {
  slug: string;                    // URL-safe identifier
  url?: string;                    // Full URL path (if item has a page)
  Content?: AstroComponentFactory; // Rendered MDX content (undefined for JSON entries)
  content?: string;                // Body text for components to use
}

/**
 * A fully prepared collection item with URLs and Content
 * Extends BaseData to include all common schema fields
 */
export type PreparedItem = BaseData & PreparedFields;

/**
 * Prepare a single collection entry for use in pages/components
 * 
 * Components should use lowercase 'content' for body text.
 * Pages can use uppercase 'Content' for rich MDX rendering.
 * 
 * @param entry - Raw collection entry from Astro
 * @param collection - Name of the collection this entry belongs to
 * @param meta - Collection metadata from _meta.mdx
 * @returns Prepared item with slug, URL, Content, and content ready to use
 */
export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData
): Promise<PreparedItem> {
  // Get the unique identifier for this entry
  const identifier = getItemKey(entry);
  
  // Keep raw data - components will query for references themselves
  const data = entry.data as Record<string, any>;
  
  // Check if this entry already has a URL (e.g., from a custom loader)
  const hasExistingUrl = data.url !== undefined;
  
  // Determine if item should have a page
  const hasPage = shouldItemHavePage(entry, meta);
  
  // Determine URL path based on rootPath setting
  let itemUrl: string | undefined;
  if (!hasExistingUrl && hasPage) {
    const useRootPath = shouldItemUseRootPath(entry, meta);
    itemUrl = useRootPath ? `/${identifier}` : `/${collection}/${identifier}`;
  }
  
  // Automatically render MDX content if available
  // MDX/MD files have a render() method, JSON entries don't
  let Content: AstroComponentFactory | undefined;
  const entryWithRender = entry as any;
  if (entryWithRender && typeof entryWithRender.render === 'function') {
    try {
      const rendered = await entryWithRender.render();
      Content = rendered.Content;
    } catch (error) {
      console.warn(`Failed to render content for ${collection}/${identifier}:`, error);
    }
  }
  
  // Get body text if it exists (MDX/MD files have this)
  // This is what components should use
  let content: string | undefined;
  if ('body' in entry) {
    content = (entry as any).body;
  }
  
  // Return the prepared item with slug, URL, Content, and content
  return {
    ...data,
    slug: identifier,
    ...(itemUrl && { url: itemUrl }),
    ...(Content && { Content }),
    ...(content && { content }),
  } as PreparedItem;
}

/**
 * Prepare all entries in a collection
 * 
 * Calls prepareEntry for each entry in the collection and returns
 * an array of prepared items ready for rendering.
 * Automatically renders MDX content for all MDX entries.
 * 
 * @param entries - Array of raw collection entries
 * @param collection - Collection name
 * @param meta - Collection metadata
 * @returns Array of prepared items
 */
export async function prepareCollectionEntries<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T,
  meta: MetaData
): Promise<PreparedItem[]> {
  return Promise.all(
    entries.map(entry => prepareEntry(entry, collection, meta))
  );
}