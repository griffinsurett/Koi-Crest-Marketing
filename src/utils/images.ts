// src/utils/images.ts
/**
 * Image URL Utilities
 *
 * Helper functions for extracting image URLs from Astro-processed images.
 * Now that we enforce image() in the schema, we know all images are
 * properly processed and have predictable structures.
 */

import type { ImageInput } from "@/content/schema";

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
