// src/utils/images.ts
/**
 * Image Utilities
 *
 * Helper functions for working with Astro-processed images.
 * Handles both formats: direct ImageMetadata and { src: ImageMetadata, alt: string }
 */

import type { ImageMetadata } from "astro";
import type { ImageInput } from "@/content/schema";

/**
 * Type guard to check if a value is Astro ImageMetadata
 */
export function isImageMetadata(img: unknown): img is ImageMetadata {
  return Boolean(
    img &&
      typeof img === "object" &&
      "width" in img &&
      "height" in img &&
      "src" in img
  );
}

/**
 * Extract ImageMetadata from various image input formats.
 * Handles: direct ImageMetadata, { src: ImageMetadata, alt? }, or undefined
 */
export function resolveImageMetadata(
  img?: ImageInput | null
): ImageMetadata | undefined {
  if (!img) return undefined;

  // Direct ImageMetadata (from direct image() usage)
  if (isImageMetadata(img)) return img;

  // Wrapped format { src: ImageMetadata, alt?: string }
  if (
    typeof img === "object" &&
    "src" in img &&
    img.src &&
    isImageMetadata(img.src)
  ) {
    return img.src;
  }

  return undefined;
}

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
 * Types for collection images
 */
export type CollectionImage = ImageInput | undefined | null;

export type NormalizedImage =
  | { type: "asset"; src: ImageMetadata; alt: string }
  | { type: "url"; src: string; alt: string };

/**
 * Normalize a collection image to a consistent format for rendering
 * Returns undefined if no valid image is provided
 */
export function normalizeCollectionImage(
  img: CollectionImage,
  fallbackAlt: string
): NormalizedImage | undefined {
  if (!img) return undefined;

  // Check if it's ImageMetadata (Astro asset)
  if (isImageMetadata(img)) {
    return {
      type: "asset",
      src: img,
      alt: fallbackAlt,
    };
  }

  // Check if it's wrapped format { src: ImageMetadata, alt?: string }
  if (typeof img === "object" && "src" in img) {
    const src = img.src;
    const alt =
      "alt" in img && typeof img.alt === "string" ? img.alt : fallbackAlt;

    // src is ImageMetadata
    if (isImageMetadata(src)) {
      return {
        type: "asset",
        src: src,
        alt: alt,
      };
    }

    // src is a string URL
    if (typeof src === "string") {
      return {
        type: "url",
        src: src,
        alt: alt,
      };
    }
  }

  return undefined;
}
