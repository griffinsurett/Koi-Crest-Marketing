// src/components/LoopComponents/ScrollableViewport.tsx
// Shared scrollable viewport with auto-scroll and click-to-scroll behavior
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { useEngagementAutoScroll } from "@/hooks/autoscroll/useEngagementAutoScroll";
import { useClickToScroll } from "@/hooks/interactions/useClickToScroll";

const AUTO_SCROLL_START_DELAY_MS = 200;
const AUTO_SCROLL_RESUME_DELAY_MS = 300;
// Fixed scroll speed in pixels per second - all images scroll at the same visual rate
const AUTO_SCROLL_FIXED_SPEED_PX_SEC = 98;
// Minimum duration before advancing to next slide (prevents rapid cycling on short content)
const AUTO_SCROLL_MIN_DURATION_MS = 3000;
// Simple delay before considering content ready (allows images to load)
const CONTENT_READY_DELAY_MS = 350;

export interface ScrollableViewportProps {
  children: ReactNode;
  isActive: boolean;
  isTransitioning?: boolean;
  onScrollComplete?: () => void;
  /** Fixed scroll speed in pixels per second (default: 65) */
  speedPxPerSec?: number;
  className?: string;
  style?: CSSProperties;
  resetOnActivate?: boolean;
  showDevOverlay?: boolean;
}

export interface ScrollableViewportRef {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  contentReady: boolean;
  scrollDurationMs: number;
  autoScroll: ReturnType<typeof useEngagementAutoScroll>;
  manualScrollEnabled: boolean;
}

export default function ScrollableViewport({
  children,
  isActive,
  isTransitioning = false,
  onScrollComplete,
  speedPxPerSec = AUTO_SCROLL_FIXED_SPEED_PX_SEC,
  className = "",
  style,
  resetOnActivate = true,
  showDevOverlay = false,
}: ScrollableViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [contentReady, setContentReady] = useState(false);
  const [scrollDurationMs, setScrollDurationMs] = useState(AUTO_SCROLL_MIN_DURATION_MS);
  const [progressPct, setProgressPct] = useState(0);

  // Calculate how long it will take to scroll through the content at the fixed speed
  const measureScrollDuration = useCallback(
    (host: HTMLElement) => {
      const maxScrollable = Math.max(0, host.scrollHeight - host.clientHeight);
      if (maxScrollable <= 0) return AUTO_SCROLL_MIN_DURATION_MS;
      const durationMs = Math.round((maxScrollable / speedPxPerSec) * 1000);
      return Math.max(AUTO_SCROLL_MIN_DURATION_MS, durationMs);
    },
    [speedPxPerSec],
  );

  const autoScrollActive = isActive && contentReady && !isTransitioning;

  const autoScroll = useEngagementAutoScroll({
    ref: viewportRef,
    active: autoScrollActive,
    speed: speedPxPerSec, // Fixed speed - same for all content
    loop: false,
    startDelay: AUTO_SCROLL_START_DELAY_MS,
    resumeDelay: AUTO_SCROLL_RESUME_DELAY_MS,
    resumeOnUserInput: true,
    threshold: 0.05,
    resetOnInactive: false,
  });

  // Click-to-scroll: manual scroll only enabled after explicit click, disables after 3s inactivity
  const { enabled: manualScrollEnabled, enableScroll } = useClickToScroll({
    ref: viewportRef,
    active: isActive,
  });

  // Simple content ready detection: just use a short delay when becoming active
  useEffect(() => {
    if (!isActive) {
      setContentReady(false);
      return;
    }

    // Reset scroll position when becoming active
    if (resetOnActivate) {
      autoScroll.resetPosition(0);
      viewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    // Simple delay to allow content to render
    const timer = window.setTimeout(() => {
      setContentReady(true);
    }, CONTENT_READY_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isActive, resetOnActivate, autoScroll.resetPosition]);

  // Track scroll progress
  useEffect(() => {
    if (!isActive) return;
    let raf: number | null = null;
    const tick = () => {
      const el = viewportRef.current;
      if (el) {
        const max = Math.max(0, el.scrollHeight - el.clientHeight);
        const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
        setProgressPct(Math.round(pct));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isActive]);

  // Measure scroll duration when content is ready
  useEffect(() => {
    if (!contentReady || !isActive) {
      setScrollDurationMs(AUTO_SCROLL_MIN_DURATION_MS);
      return;
    }

    const host = viewportRef.current;
    if (!host) return;

    const updateDuration = () => setScrollDurationMs(measureScrollDuration(host));
    updateDuration();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateDuration())
        : null;

    observer?.observe(host);

    return () => observer?.disconnect();
  }, [contentReady, isActive, measureScrollDuration]);

  // Trigger callback after scroll completes
  // Use a ref to track the current duration to avoid restarting timer on every measurement
  const scrollDurationRef = useRef(scrollDurationMs);
  scrollDurationRef.current = scrollDurationMs;

  useEffect(() => {
    if (!contentReady || !isActive || !onScrollComplete) return;
    // Don't start new cycle if autoscroll is paused by user interaction
    if (autoScroll.paused) return;

    const BETWEEN_SLIDE_PAUSE_MS = 450;
    const totalDuration =
      AUTO_SCROLL_START_DELAY_MS + scrollDurationRef.current + BETWEEN_SLIDE_PAUSE_MS;
    const timer = window.setTimeout(() => {
      // Double-check we're still active before completing cycle
      if (!autoScroll.paused) {
        onScrollComplete();
      }
    }, totalDuration);
    return () => window.clearTimeout(timer);
  }, [isActive, contentReady, onScrollComplete, autoScroll.paused]);

  // When manual scroll is disabled, we use pointer-events:none on the scrollable
  // figure so wheel/touch events pass through to the page. But we need an outer
  // wrapper to capture clicks to enable manual scroll.
  return (
    <div
      className={`relative h-full ${className}`.trim()}
      style={style}
      onClick={enableScroll}
    >
      <figure
        ref={viewportRef}
        className={`absolute inset-0 overflow-y-scroll bg-black/40 ${
          manualScrollEnabled
            ? "overscroll-contain touch-pan-y"
            : "pointer-events-none touch-none"
        }`}
        style={{
          WebkitOverflowScrolling: manualScrollEnabled ? "touch" : "auto",
          overscrollBehaviorY: manualScrollEnabled ? "contain" : "none",
        }}
      >
        {children}
      </figure>

      {import.meta.env.DEV && showDevOverlay && isActive && (
        <div className="absolute right-3 top-3 text-xs opacity-75 bg-zinc-800/95 p-3 rounded-lg shadow-lg border border-white/10 z-50 space-y-1 pointer-events-none">
          <div>In View: {autoScroll.inView ? "Y" : "N"}</div>
          <div>Paused: {autoScroll.paused ? "Y" : "N"}</div>
          <div>Engaged: {autoScroll.engaged ? "Y" : "N"}</div>
          <div>Resume: {autoScroll.resumeScheduled ? "Y" : "N"}</div>
          <div>Manual: {manualScrollEnabled ? "Y" : "N"}</div>
          <div>Progress: {progressPct}%</div>
          <div>Duration: {(scrollDurationMs / 1000).toFixed(1)}s</div>
          <div>Speed: {speedPxPerSec}px/s</div>
          <div>Ready: {contentReady ? "Y" : "N"}</div>
        </div>
      )}
    </div>
  );
}
