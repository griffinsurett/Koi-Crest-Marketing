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

/**
 * Pre-load all asset images for resolving frontmatter image paths
 */
const assetImages = import.meta.glob<{ default: ImageMetadata }>(
  "../../assets/**/*.{png,jpg,jpeg,gif,webp,svg}",
  { eager: true }
);

/**
 * Resolve a relative image path from frontmatter to an ImageMetadata object
 */
function resolveImagePath(imagePath: string): ImageMetadata | undefined {
  if (!imagePath || typeof imagePath !== "string") return undefined;

  // Handle relative paths like "../../assets/template-3.png"
  // Convert to the glob key format "../../assets/template-3.png"
  const normalizedPath = imagePath.startsWith("../../assets/")
    ? imagePath
    : imagePath.startsWith("../assets/")
    ? `../${imagePath}`
    : imagePath;

  const imageKey = Object.keys(assetImages).find((k) => k.endsWith(normalizedPath.replace("../../", "")));

  if (imageKey && assetImages[imageKey]) {
    return assetImages[imageKey].default;
  }

  return undefined;
}

/**
 * Process frontmatter data to resolve image paths to ImageMetadata
 */
function processMetaImages(data: Record<string, any>): Record<string, any> {
  const processed = { ...data };

  // Process featuredImage
  if (processed.featuredImage) {
    if (typeof processed.featuredImage === "string") {
      const resolved = resolveImagePath(processed.featuredImage);
      if (resolved) {
        processed.featuredImage = resolved;
      }
    } else if (typeof processed.featuredImage === "object" && processed.featuredImage.src) {
      const resolved = resolveImagePath(processed.featuredImage.src);
      if (resolved) {
        processed.featuredImage = {
          src: resolved,
          alt: processed.featuredImage.alt,
        };
      }
    }
  }

  // Process bannerImage similarly
  if (processed.bannerImage) {
    if (typeof processed.bannerImage === "string") {
      const resolved = resolveImagePath(processed.bannerImage);
      if (resolved) {
        processed.bannerImage = resolved;
      }
    } else if (typeof processed.bannerImage === "object" && processed.bannerImage.src) {
      const resolved = resolveImagePath(processed.bannerImage.src);
      if (resolved) {
        processed.bannerImage = {
          src: resolved,
          alt: processed.bannerImage.alt,
        };
      }
    }
  }

  return processed;
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

  const rawData = mdxKey ? (mdxModules[mdxKey] as any).frontmatter ?? {} : {};

  // Process image paths to resolve them to ImageMetadata objects
  const data = processMetaImages(rawData);

  // For _meta.mdx, images are now resolved ImageMetadata or passthrough
  const passthroughImage = () => z.any().optional();

  return metaSchema({ image: passthroughImage }).parse(data);
}
