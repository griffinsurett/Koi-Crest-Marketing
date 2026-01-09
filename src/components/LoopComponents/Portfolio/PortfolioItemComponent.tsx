// src/components/LoopComponents/Portfolio/PortfolioItemComponent.tsx
// Refactored to use shared types and ScrollableViewport component
import { useMemo } from "react";
import ScrollableViewport from "@/components/LoopComponents/Portfolio/ScrollableViewport";
import {
  type PortfolioItemData,
  type PortfolioMediaEntry,
  getPortfolioImageSrc,
} from "./types";

// Re-export types for consumers
export type { PortfolioItemData, PortfolioMediaEntry, PortfolioImageSources } from "./types";

interface PortfolioItemComponentProps {
  item: PortfolioItemData;
  i: number;
  activeIndex: number;
  itemsLength: number;
  centerW: number;
  centerH: number;
  sideW: number;
  sideH: number;
  tx: number;
  onSelect: (index: number) => void;
  onScrollComplete?: () => void;
  mediaEntry?: PortfolioMediaEntry;
}

export default function PortfolioItemComponent({
  item,
  i,
  activeIndex,
  itemsLength,
  centerW,
  centerH,
  sideW,
  sideH,
  tx,
  onSelect,
  onScrollComplete,
  mediaEntry,
}: PortfolioItemComponentProps) {
  const diff = i - activeIndex;
  const isActive = diff === 0;

  const position = useMemo(() => {
    if (diff === 0) return "center";
    if (diff === -1 || diff === itemsLength - 1) return "left";
    if (diff === 1 || diff === -(itemsLength - 1)) return "right";
    return "hidden";
  }, [diff, itemsLength]);

  const translateBase = isActive ? "translate(-50%, 0)" : "translate(-50%, -50%)";

  const slideBase =
    "absolute left-1/2 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform bg-gray-900";

  let style: React.CSSProperties = {
    width: `${sideW}px`,
    height: `${sideH}px`,
    transform: `${translateBase} scale(0)`,
    zIndex: 10,
    opacity: 0,
    pointerEvents: "none",
  };

  if (isActive) {
    style = {
      width: `${centerW}px`,
      height: `${centerH}px`,
      transform: `${translateBase} scale(1) rotateY(0deg)`,
      zIndex: 30,
      opacity: 1,
    };
  } else if (position === "left") {
    style = {
      width: `${sideW}px`,
      height: `${sideH}px`,
      transform: `${translateBase} translateX(-${tx}px) scale(0.9) rotateY(22deg)`,
      zIndex: 20,
      opacity: 0.4,
    };
  } else if (position === "right") {
    style = {
      width: `${sideW}px`,
      height: `${sideH}px`,
      transform: `${translateBase} translateX(${tx}px) scale(0.9) rotateY(-22deg)`,
      zIndex: 20,
      opacity: 0.4,
    };
  }

  const getImageSrcForPosition = () => {
    const fallback = getPortfolioImageSrc(item);

    if (item.imageSources) {
      if (isActive && item.imageSources.center) return item.imageSources.center;
      if ((position === "left" || position === "right") && item.imageSources.side)
        return item.imageSources.side;
      if (item.imageSources.mobile) return item.imageSources.mobile;
    }

    return fallback;
  };

  const imageSrc = getImageSrcForPosition();
  const altText = mediaEntry?.alt || item.alt || item.title || "Project preview";

  const renderMedia = () => {
    // If mediaEntry provided, use picture element with srcset for optimized loading
    if (mediaEntry?.sources?.length) {
      return (
        <picture>
          {mediaEntry.sources.map((source, idx) => (
            <source
              key={`source-${idx}`}
              srcSet={source.srcSet}
              sizes={source.sizes ?? mediaEntry.sizes}
              type={source.type}
            />
          ))}
          <img
            src={mediaEntry.src}
            srcSet={mediaEntry.srcSet}
            sizes={mediaEntry.sizes}
            alt={altText}
            width={mediaEntry.width}
            height={mediaEntry.height}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="block w-full h-auto min-h-full select-none object-cover object-top"
          />
        </picture>
      );
    }

    if (mediaEntry?.src) {
      return (
        <img
          src={mediaEntry.src}
          srcSet={mediaEntry.srcSet}
          sizes={mediaEntry.sizes}
          alt={altText}
          width={mediaEntry.width}
          height={mediaEntry.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block w-full h-auto min-h-full select-none object-cover object-top"
        />
      );
    }

    // Fallback to item's direct image sources
    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={altText}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          className="block w-full h-auto min-h-full select-none object-cover object-top"
          decoding="async"
        />
      );
    }

    // No image available - show placeholder
    return (
      <div className="flex h-full w-full bg-gradient-to-b from-bg2 via-bg to-bg/80" />
    );
  };

  return (
    <div
      className={`${slideBase} ${isActive ? "top-0" : "top-1/2"}`}
      style={style}
      data-carousel-item
      data-index={i}
      data-active={isActive ? "true" : "false"}
      onClick={() => {
        if (!isActive) {
          onSelect(i);
        }
      }}
    >
      <ScrollableViewport
        isActive={isActive}
        isTransitioning={false}
        onScrollComplete={isActive && itemsLength > 1 ? onScrollComplete : undefined}
        speedPxPerSec={98}
        resetOnActivate={true}
        showDevOverlay={true}
        className="w-full h-full bg-gray-900 m-0 p-0"
      >
        {renderMedia()}
      </ScrollableViewport>
    </div>
  );
}
