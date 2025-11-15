// src/utils/collections/core.ts
/**
 * Core Collection Management - FULLY LAZY
 */

import type { CollectionKey, CollectionEntry } from "astro:content";
import { collections } from "@/content/config";
import type { MetaData } from "@/content/schema";

// ❌ NO astro:content imports at module level

export function getCollectionNames(): string[] {
  return Object.keys(collections);
}

type AnyItem =
  | CollectionEntry<CollectionKey>
  | { slug?: string; id?: string; [key: string]: unknown };

export function getItemKey(item: AnyItem): string {
  if (!item) return "";
  if ("slug" in item && typeof item.slug === "string" && item.slug)
    return item.slug;
  if ("id" in item && typeof item.id === "string" && item.id) return item.id;
  return "";
}

export async function getCollectionWithMeta(collectionName: CollectionKey) {
  const { metaSchema } = await import("@/content/schema");

  const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
    "../../content/**/_meta.mdx",
    { eager: true }
  );

  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );

  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  const simpleImageFn = () => ({
    parse: (val: any) => val,
    _parse: (val: any) => ({ success: true, data: val }),
  });

  const meta: MetaData = metaSchema({ image: simpleImageFn }).parse(data);

  // ✅ Lazy import
  const { getCollection } = await import("astro:content");
  const entries = await getCollection(collectionName);

  return { entries, meta, collectionName };
}
