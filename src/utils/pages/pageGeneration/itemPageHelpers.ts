// src/utils/pages/pageGeneration/itemPageHelpers.ts
/**
 * Item Page Generation Helpers
 *
 * Shared utilities for generating individual item pages.
 * Used by both root-level and collection-level page routes.
 */

import type { CollectionKey, CollectionEntry } from "astro:content";
import { getCollection, render as renderEntry } from "astro:content";
import { getCollectionMeta } from "@/utils/collections";
import {
  shouldItemHavePage,
  shouldItemUseRootPath,
  shouldProcessCollection,
} from "@/utils/pages";
import { getPageCollections } from "@/utils/pages/pageGeneration";
import { buildItemSEOProps } from "@/utils/seo";
import {
  getLayoutPath,
  getLayoutComponent,
} from "@/layouts/collections/helpers/layoutUtils";
import type { MetaData } from "@/content/schema";

/**
 * Filter function type for determining which items to include
 */
export type ItemFilter = (
  entry: CollectionEntry<CollectionKey>,
  meta: MetaData
) => boolean;

/**
 * Path parameters for root-level items
 */
export interface RootLevelPathParams {
  id: string;
}

/**
 * Path parameters for collection-level items
 */
export interface CollectionLevelPathParams {
  collection: string;
  id: string;
}

/**
 * Props passed to item page components
 */
export interface ItemPageProps {
  entry: CollectionEntry<CollectionKey>;
  collectionMeta: MetaData;
  collectionName: CollectionKey;
}

/**
 * Generic static path entry
 */
export interface StaticPath<TParams> {
  params: TParams;
  props: ItemPageProps;
}

/**
 * Prepared page data ready for rendering
 */
export interface PreparedPageData {
  entry: CollectionEntry<CollectionKey>;
  collectionMeta: MetaData;
  collectionName: CollectionKey;
  LayoutComponent: any;
  Content: any;
  seoProps: any;
}

/**
 * Generate static paths for items matching a filter
 */
export async function generateItemPaths<TParams>(
  filter: ItemFilter,
  buildParams: (collection: string, id: string) => TParams
): Promise<StaticPath<TParams>[]> {
  const collections = getPageCollections();
  const paths: StaticPath<TParams>[] = [];

  for (const coll of collections) {
    const collectionKey = coll as CollectionKey;

    const shouldProcess = await shouldProcessCollection(collectionKey);
    if (!shouldProcess) continue;

    const meta = getCollectionMeta(collectionKey);
    const entries = (await getCollection(collectionKey)) as CollectionEntry<
      typeof collectionKey
    >[];

    entries
      .filter((entry) => filter(entry as CollectionEntry<CollectionKey>, meta))
      .forEach((entry) => {
        const id = entry.id;
        paths.push({
          params: buildParams(collectionKey, id),
          props: {
            entry: entry as CollectionEntry<CollectionKey>,
            collectionMeta: meta,
            collectionName: collectionKey,
          },
        });
      });
  }

  return paths;
}

/**
 * Prepare all data needed to render an item page
 */
export async function prepareItemPageData(
  props: ItemPageProps
): Promise<PreparedPageData> {
  const { entry, collectionMeta, collectionName } = props;

  const layoutPath = getLayoutPath(collectionMeta, entry, true);
  const LayoutComponent = await getLayoutComponent(layoutPath);

  let Content = null;
  try {
    const rendered = await renderEntry(entry as any);
    Content = rendered?.Content ?? null;
  } catch {
    Content = null;
  }

  const seoProps = await buildItemSEOProps(entry, collectionMeta);

  return {
    entry,
    collectionMeta,
    collectionName,
    LayoutComponent,
    Content,
    seoProps,
  };
}

/**
 * Filter for root-level items
 */
export const rootLevelFilter: ItemFilter = (entry, meta) => {
  return shouldItemHavePage(entry, meta) && shouldItemUseRootPath(entry, meta);
};

/**
 * Filter for collection-level items
 */
export const collectionLevelFilter: ItemFilter = (entry, meta) => {
  return shouldItemHavePage(entry, meta) && !shouldItemUseRootPath(entry, meta);
};

/**
 * Build params for root-level paths
 */
export function buildRootLevelParams(
  _collection: string,
  id: string
): RootLevelPathParams {
  return { id };
}

/**
 * Build params for collection-level paths
 */
export function buildCollectionLevelParams(
  collection: string,
  id: string
): CollectionLevelPathParams {
  return { collection, id };
}
