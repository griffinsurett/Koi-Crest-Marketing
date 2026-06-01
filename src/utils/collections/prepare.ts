// src/utils/collections/prepare.ts
/**
 * Collection Entry Preparation - LAZY RENDER
 */

import type { CollectionKey, CollectionEntry } from "astro:content";
import { render as renderEntry } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { MetaData, BaseData } from "@/content/schema";

export interface PreparedFields {
  id: string;
  url?: string;
  displayValue?: string;
  render?: () => Promise<{ Content: AstroComponentFactory }>;
  content?: string;
}

export type PreparedItem = BaseData & PreparedFields;

function getFirstParentId(parent: string | string[] | undefined): string | undefined {
  if (!parent) return undefined;
  if (Array.isArray(parent)) return parent[0];
  return parent;
}

export async function prepareEntry<T extends CollectionKey>(
  entry: CollectionEntry<T>,
  collection: T,
  meta: MetaData,
  entriesMap?: Map<string, CollectionEntry<T>>
): Promise<PreparedItem> {
  const { shouldItemHavePage, shouldItemUseRootPath } = await import("@/utils/pages");
  const { applyLinkBehavior, mergeLinkBehavior } = await import("@/utils/links/linkBehavior");

  const identifier = entry.id;
  const data = entry.data as Record<string, any>;

  const parentId = getFirstParentId(data.parent);
  const parentEntry = parentId && entriesMap ? entriesMap.get(parentId) : undefined;

  const linkBehavior = mergeLinkBehavior(data.linkBehavior, meta.itemsLinkBehavior);

  let itemUrl: string | undefined;
  let displayValue: string | undefined;

  if (linkBehavior) {
    const linkResult = applyLinkBehavior(data, linkBehavior, collection as string, identifier);
    itemUrl = linkResult.url;
    displayValue = linkResult.displayValue;
  } else {
    const hasExistingUrl = data.url !== undefined;
    const hasPage = shouldItemHavePage(entry, meta, parentEntry);

    if (!hasExistingUrl && hasPage) {
      const useRootPath = shouldItemUseRootPath(entry, meta);
      itemUrl = useRootPath ? `/${identifier}` : `/${collection}/${identifier}`;
    }
  }

  let content: string | undefined;
  if ("body" in entry) {
    content = (entry as any).body;
  }

  const hasBody = "body" in entry && (entry as any).body;
  const renderFn = hasBody ? () => renderEntry(entry as any) : undefined;

  return {
    ...data,
    id: identifier,
    ...(itemUrl && { url: itemUrl }),
    ...(displayValue && { displayValue }),
    ...(renderFn && { render: renderFn }),
    ...(content && { content }),
  } as PreparedItem;
}

export async function prepareCollectionEntries<T extends CollectionKey>(
  entries: CollectionEntry<T>[],
  collection: T,
  meta: MetaData
): Promise<PreparedItem[]> {
  const entriesMap = new Map<string, CollectionEntry<T>>();
  for (const entry of entries) {
    if (entry.id) entriesMap.set(entry.id, entry);
  }

  return Promise.all(
    entries.map((entry) => prepareEntry(entry, collection, meta, entriesMap))
  );
}
