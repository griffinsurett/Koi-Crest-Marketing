// src/utils/IntersectionObserver.ts
/**
 * IntersectionObserver utility for visibility detection
 */

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  once?: boolean;
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onExit?: (entry: IntersectionObserverEntry) => void;
}

interface IntersectionObserverResult {
  isVisible: boolean;
  hasBeenSeen: boolean;
  disconnect: () => void;
}

export function createIntersectionObserver(
  element: HTMLElement,
  options: IntersectionObserverOptions = {}
): IntersectionObserverResult {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    once = false,
    onEnter,
    onExit,
  } = options;

  let isVisible = false;
  let hasBeenSeen = false;

  if (typeof IntersectionObserver === "undefined") {
    // Fallback for SSR or unsupported browsers
    return {
      isVisible: true,
      hasBeenSeen: true,
      disconnect: () => {},
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible = true;
          hasBeenSeen = true;
          onEnter?.(entry);

          if (once) {
            observer.disconnect();
          }
        } else {
          isVisible = false;
          onExit?.(entry);
        }
      });
    },
    {
      threshold,
      root,
      rootMargin,
    }
  );

  observer.observe(element);

  return {
    isVisible,
    hasBeenSeen,
    disconnect: () => observer.disconnect(),
  };
}
