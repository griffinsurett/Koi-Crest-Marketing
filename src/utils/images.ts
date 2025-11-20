// src/utils/images.ts
/**
 * Image utilities shared across layouts and variants.
 *
 * The helpers below are intentionally light-weight so they can be used
 * both in collection items (which go through schema validation) and in
 * `_meta.mdx` frontmatter (which ships raw strings).
 */

import type { ImageInput } from "@/content/schema";
import type { ImageMetadata } from "astro";

const assetModules = import.meta.glob<ImageMetadata>("../assets/**/*", {
  eager: true,
  import: "default",
});

const assetLookup = new Map<string, ImageMetadata>();

const normalizeSegment = (value: string) =>
  value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");

const addLookupKeys = (key: string, metadata: ImageMetadata) => {
  const cleaned = normalizeSegment(key);
  const variants = new Set<string>();

  const withoutTraversal = cleaned.replace(/^(\.\.\/)+/, "");
  const withoutSrcPrefix = withoutTraversal.replace(/^src\//, "");
  const assetPath = withoutSrcPrefix.startsWith("assets/")
    ? withoutSrcPrefix
    : `assets/${withoutSrcPrefix}`;
  const bare = assetPath.replace(/^assets\//, "");

  [
    cleaned,
    withoutTraversal,
    withoutSrcPrefix,
    assetPath,
    `@/${assetPath}`,
    `/src/${withoutSrcPrefix}`,
    `/assets/${bare}`,
    bare,
  ].forEach((variant) => {
    if (variant) {
      variants.add(variant);
    }
  });

  const filename = bare.split("/").pop();
  if (filename) {
    variants.add(filename);
  }

  variants.forEach((variant) => assetLookup.set(variant, metadata));
};

Object.entries(assetModules).forEach(([key, metadata]) => {
  addLookupKeys(key, metadata);
});

const findAssetByPath = (value: string): ImageMetadata | undefined => {
  const normalized = normalizeSegment(value);
  const candidates = [
    normalized,
    normalized.replace(/^(\.\.\/)+/, ""),
    normalized.replace(/^src\//, ""),
    normalized.startsWith("@/") ? normalized : `@/${normalized}`,
    normalized.startsWith("/") ? normalized : `/${normalized}`,
  ];

  const filename = normalized.split("/").pop();
  if (filename) {
    candidates.push(filename);
  }

  for (const candidate of candidates) {
    const asset = assetLookup.get(candidate);
    if (asset) return asset;
  }

  return undefined;
};

/**
 * Extract image URL from Astro-processed image
 *
 * With proper schema enforcement, images come in predictable formats:
 * - Astro ImageMetadata objects with src property
 * - Image objects with src: ImageMetadata
 *
 * @param img - Astro-processed image
 * @param fallback - URL to use if img is undefined
 * @returns Image URL string
 */
export function getImageUrl(
  img: ImageInput | undefined,
  fallback: string
): string {
  if (!img) return fallback;

  // ImageMetadata object (from image() helper)
  if (typeof img === "object" && "src" in img) {
    const src = img.src;

    // src is a string (processed by Astro)
    if (typeof src === "string") {
      return src;
    }

    // src is nested ImageMetadata
    if (
      typeof src === "object" &&
      src &&
      "src" in src &&
      typeof src.src === "string"
    ) {
      return src.src;
    }
  }

  // Fallback
  return fallback;
}

/**
 * Extract alt text from image object
 *
 * @param img - Image with potential alt text
 * @param fallback - Fallback alt text
 * @returns Alt text string
 */
export function getImageAlt(
  img: ImageInput | undefined,
  fallback: string
): string {
  if (!img) return fallback;

  if (typeof img === "object" && "alt" in img && typeof img.alt === "string") {
    return img.alt;
  }

  return fallback;
}

/**
 * Type guard for image object with alt
 */
export function hasAltText(img: any): img is { src: any; alt: string } {
  return (
    img &&
    typeof img === "object" &&
    "alt" in img &&
    typeof img.alt === "string"
  );
}

/**
 * Broader image type for collection metadata (strings or image() output)
 */
export type CollectionImage =
  | ImageInput
  | ImageMetadata
  | string
  | { src?: ImageInput | ImageMetadata | string; alt?: string }
  | CollectionImage[];

export type NormalizedImage =
  | { type: "asset"; src: ImageMetadata; alt: string }
  | { type: "url"; src: string; alt: string };

const isImageMetadata = (value: unknown): value is ImageMetadata =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as Record<string, unknown>).src === "string" &&
      typeof (value as Record<string, unknown>).width === "number" &&
      typeof (value as Record<string, unknown>).height === "number"
  );

/**
 * Normalize any collection image input (schema-based or raw string)
 * into a structure the UI can render. Returns undefined when no image is set.
 */
export function normalizeCollectionImage(
  image: CollectionImage | undefined,
  fallbackAlt: string
): NormalizedImage | undefined {
  const raw = Array.isArray(image) ? image[0] : image;
  if (!raw) return undefined;

  if (isImageMetadata(raw)) {
    return { type: "asset", src: raw, alt: fallbackAlt };
  }

  if (typeof raw === "string") {
    const asset = findAssetByPath(raw);
    if (asset) {
      return { type: "asset", src: asset, alt: fallbackAlt };
    }
    return { type: "url", src: raw, alt: fallbackAlt };
  }

  if (typeof raw === "object" && "src" in raw) {
    const srcValue = (raw as any).src;
    const alt =
      typeof (raw as any).alt === "string" && (raw as any).alt.trim().length > 0
        ? (raw as any).alt
        : fallbackAlt;

    if (isImageMetadata(srcValue)) {
      return { type: "asset", src: srcValue, alt };
    }

    if (typeof srcValue === "string") {
      const asset = findAssetByPath(srcValue);
      if (asset) {
        return { type: "asset", src: asset, alt };
      }
      return { type: "url", src: srcValue, alt };
    }
  }

  return undefined;
}
