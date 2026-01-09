// src/components/LoopTemplates/Portfolio/PortfolioCarousel.tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import PortfolioItemComponent from "@/components/LoopComponents/Portfolio/PortfolioItemComponent";
import { type PortfolioItemData, type PortfolioMediaEntry, normalizeItems } from "@/components/LoopComponents/Portfolio/types";
import { LeftArrow, RightArrow } from "@/components/Carousels/CarouselArrows";
import { useSideDragNavigation } from "@/hooks/interactions/useSideDragNavigation";
import { useKeyboardInteraction } from "@/hooks/interactions/useKeyboardInteraction";
import { animationProps } from "@/integrations/scroll-animations";

interface PortfolioCarouselProps {
  items?: PortfolioItemData[];
  mediaEntries?: (PortfolioMediaEntry | undefined)[];
  defaultIndex?: number;
  showArrows?: boolean;
  showDots?: boolean;
  drag?: boolean;
  className?: string;
}

export default function PortfolioCarousel({
  items = [],
  mediaEntries: mediaEntriesProp = [],
  defaultIndex = 0,
  showArrows = true,
  showDots = true,
  drag = false,
  className = "",
}: PortfolioCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(defaultIndex);
  const [containerW, setContainerW] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const slides = useMemo(() => normalizeItems(items), [items]);
  const mediaEntries = useMemo(() => normalizeItems(mediaEntriesProp), [mediaEntriesProp]);

  const ready = containerW > 0;

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      const width = element.getBoundingClientRect().width;
      if (width && width !== containerW) setContainerW(width);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerW]);

  // Advance to next slide when scroll completes (same as screen variant)
  const handleScrollComplete = useCallback(() => {
    if (!slides.length || slides.length <= 1) return;
    setIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const getSizes = () => {
    const width = containerW;
    if (width < 640)
      return { centerW: 280, centerH: 190, sideW: 180, sideH: 120 };
    if (width < 768)
      return { centerW: 340, centerH: 230, sideW: 220, sideH: 150 };
    if (width < 1024)
      return { centerW: 460, centerH: 310, sideW: 290, sideH: 190 };
    if (width < 1280)
      return { centerW: 680, centerH: 450, sideW: 420, sideH: 290 };
    return { centerW: 860, centerH: 540, sideW: 520, sideH: 360 };
  };

  const getTranslateDistance = (sideW: number) => {
    const width = containerW;
    const bleed = width >= 1536 ? 72 : width >= 1280 ? 56 : width >= 1024 ? 40 : 20;
    const edgeGutter = -bleed;
    return width / 2 - sideW / 2 - edgeGutter;
  };

  const { centerW, centerH, sideW, sideH } = ready
    ? getSizes()
    : { centerW: 0, centerH: 0, sideW: 0, sideH: 0 };
  const tx = ready ? getTranslateDistance(sideW) : 0;

  const goToPrevious = () =>
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () =>
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const arrowDiameter = containerW >= 768 ? 48 : 40;
  const arrowRadius = arrowDiameter / 2;
  const gap = containerW >= 1024 ? 20 : 16;
  const isLarge = containerW >= 1280;

  const sideOffsetFromCenterSlide = centerW / 2 + arrowRadius + gap;
  const leftCalc = isLarge
    ? `calc(50% - ${tx}px)`
    : `calc(50% - ${sideOffsetFromCenterSlide}px)`;
  const rightCalc = isLarge
    ? `calc(50% + ${tx}px)`
    : `calc(50% + ${sideOffsetFromCenterSlide}px)`;

  const leftZoneRef = useRef<HTMLDivElement | null>(null);
  const rightZoneRef = useRef<HTMLDivElement | null>(null);

  useSideDragNavigation({
    enabled: ready && drag && slides.length > 1,
    leftElRef: leftZoneRef,
    rightElRef: rightZoneRef,
    onLeft: goToPrevious,
    onRight: goToNext,
    dragThreshold: Math.max(40, Math.round(containerW * 0.05)),
    tapThreshold: 12,
  });

  // Keyboard navigation for accessibility
  useKeyboardInteraction({
    elementRef: containerRef,
    requireFocus: true,
    onArrowLeft: goToPrevious,
    onArrowRight: goToNext,
  });

  const sideZoneWidth = Math.max(140, Math.min(sideW, 520));
  const baseZoneStyle = (leftPx: number): CSSProperties => ({
    left: `calc(50% ${leftPx >= 0 ? "+" : "-"} ${Math.abs(leftPx)}px)`,
    transform: "translateX(-50%)",
    width: `${sideZoneWidth}px`,
    top: 0,
    height: "100%",
  });

  const leftZoneOffset = isLarge ? tx : sideOffsetFromCenterSlide;
  const rightZoneOffset = isLarge ? tx : sideOffsetFromCenterSlide;

  if (!slides.length) return null;

  return (
    <div
      ref={containerRef}
      {...animationProps("fade-in", { once: true })}
      data-carousel-container
      suppressHydrationWarning
      className={`w-full ${className}`.trim()}
      tabIndex={0}
      role="region"
      aria-label="Portfolio carousel. Use left and right arrow keys to navigate."
      aria-roledescription="carousel"
    >
      {ready && (
        <>
          <div
            className="relative overflow-visible w-full leading-none"
            style={{ height: `${centerH}px` }}
          >
            {slides.map((item, slideIndex) => (
              <PortfolioItemComponent
                key={item.slug ?? item.id ?? slideIndex}
                item={item}
                i={slideIndex}
                activeIndex={index}
                itemsLength={slides.length}
                centerW={centerW}
                centerH={centerH}
                sideW={sideW}
                sideH={sideH}
                tx={tx}
                onSelect={setIndex}
                onScrollComplete={handleScrollComplete}
                mediaEntry={isHydrated ? mediaEntries[slideIndex] : undefined}
              />
            ))}

            {drag && slides.length > 1 && (
              <>
                <div
                  ref={leftZoneRef}
                  className="absolute z-30 cursor-grab touch-pan-x select-none"
                  style={baseZoneStyle(-leftZoneOffset)}
                  aria-hidden="true"
                  data-drag-zone="left"
                />
                <div
                  ref={rightZoneRef}
                  className="absolute z-30 cursor-grab touch-pan-x select-none"
                  style={baseZoneStyle(rightZoneOffset)}
                  aria-hidden="true"
                  data-drag-zone="right"
                />
              </>
            )}

            {showArrows && slides.length > 1 && (
              <>
                <LeftArrow
                  onClick={goToPrevious}
                  variant="floating"
                  position={{
                    left: leftCalc,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <RightArrow
                  onClick={goToNext}
                  variant="floating"
                  position={{
                    left: rightCalc,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </>
            )}
          </div>

          {showDots && slides.length > 1 && (
            <nav
              className="mt-6 flex justify-center gap-3"
              aria-label="Carousel Pagination"
            >
              {slides.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    dotIndex === index ? "bg-primary scale-[1.30]" : "faded-bg"
                  }`}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
