import { useEffect, useState } from "react";

const MOTION_ATTRIBUTE_FILTER: string[] = [
  "data-a11y-motion",
  "data-a11y-animations",
];

/**
 * Read the current motion preference from system settings or accessibility controls.
 * Safe for SSR – falls back to `false` when window/document are unavailable.
 */
export function readMotionPreference(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const root = document.documentElement;
  const systemPrefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const userPrefersReduced =
    root.getAttribute("data-a11y-motion") === "reduced";
  const userPausedAnimations =
    root.getAttribute("data-a11y-animations") === "true";

  return systemPrefersReduced || userPrefersReduced || userPausedAnimations;
}

/**
 * React hook that tracks whether motion/animation should be disabled.
 * Listens to system preference changes and accessibility toggles.
 */
export function useMotionPreference(respect: boolean = true): boolean {
  const [shouldDisableMotion, setShouldDisableMotion] = useState(() =>
    respect ? readMotionPreference() : false
  );

  useEffect(() => {
    if (!respect) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const updatePreference = () => {
      setShouldDisableMotion(readMotionPreference());
    };

    // Initial sync in case the value changed before hydration
    updatePreference();

    const mediaQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    mediaQuery?.addEventListener("change", updatePreference);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName &&
          MOTION_ATTRIBUTE_FILTER.includes(mutation.attributeName)
        ) {
          updatePreference();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: MOTION_ATTRIBUTE_FILTER,
    });

    return () => {
      mediaQuery?.removeEventListener("change", updatePreference);
      observer.disconnect();
    };
  }, [respect]);

  useEffect(() => {
    if (!respect) {
      setShouldDisableMotion(false);
    } else {
      setShouldDisableMotion(readMotionPreference());
    }
  }, [respect]);

  return respect ? shouldDisableMotion : false;
}
