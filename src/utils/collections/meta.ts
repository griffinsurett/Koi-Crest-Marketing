// src/utils/collections/meta.ts
/**
 * Collection Metadata Utilities
 *
 * Handles loading and parsing _meta.mdx files for collections.
 * The metadata controls collection-wide settings like:
 * - Whether the collection has an index page (hasPage)
 * - Whether individual items get pages (itemsHasPage)
 * - What layout to use for items (itemsLayout)
 * - Menu integration (addToMenu, itemsAddToMenu)
 * - SEO defaults
 */

import { metaSchema, type MetaData } from "@/content/schema";
import { z } from "astro:content";
import type { ImageMetadata } from "astro";

/**
 * Pre-load all _meta.mdx files at module load time
 * Using eager loading for better performance
 */
const mdxModules = import.meta.glob<{ frontmatter?: Record<string, any> }>(
  "../../content/**/_meta.mdx",
  { eager: true }
);

const assetModules = import.meta.glob<{ default: ImageMetadata }>(
  "../../assets/**/*.{avif,gif,jpeg,jpg,png,svg,webp}",
  { eager: true }
);

const assetPathAliases = [
  { from: "@/assets/", to: "../../assets/" },
  { from: "../../assets/", to: "../../assets/" },
  { from: "../assets/", to: "../../assets/" },
];

function resolveMetaAssetPath(path?: string): ImageMetadata | string | undefined {
  if (!path || typeof path !== "string") return undefined;

  const normalizedPath = assetPathAliases.reduce((resolved, alias) => {
    if (resolved.startsWith(alias.from)) {
      return `${alias.to}${resolved.slice(alias.from.length)}`;
    }
    return resolved;
  }, path);

  const assetModule = assetModules[normalizedPath];
  return assetModule?.default ?? path;
}

function resolveMetaImages(value: unknown): unknown {
  if (typeof value === "string") {
    return resolveMetaAssetPath(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveMetaImages(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const resolvedObject: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "src" && typeof nestedValue === "string") {
      resolvedObject[key] = resolveMetaAssetPath(nestedValue) ?? nestedValue;
      continue;
    }

    resolvedObject[key] = resolveMetaImages(nestedValue);
  }

  return resolvedObject;
}

/**
 * Get metadata for a specific collection from its _meta.mdx file
 *
 * Parses and validates the frontmatter against the metaSchema.
 * Returns default values if no _meta.mdx file exists.
 *
 * @param collectionName - Name of the collection
 * @returns Parsed and validated metadata object
 * @example
 * const meta = getCollectionMeta('blog');
 * // meta.hasPage, meta.itemsHasPage, meta.itemsLayout, etc.
 */
export function getCollectionMeta(collectionName: string): MetaData {
  const mdxKey = Object.keys(mdxModules).find((k) =>
    k.endsWith(`/${collectionName}/_meta.mdx`)
  );

  const data = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};
  const resolvedData = resolveMetaImages(data);

  // _meta.mdx image fields may still be raw strings, wrapped { src, alt } values,
  // or eagerly resolved Astro image metadata from the asset map above.
  const passthroughImage = () => z.any().optional();

  return metaSchema({ image: passthroughImage }).parse(resolvedData);
}
