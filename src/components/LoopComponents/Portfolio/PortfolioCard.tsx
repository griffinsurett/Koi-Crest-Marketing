// src/components/LoopComponents/Portfolio/PortfolioCard.tsx
import type { MouseEventHandler } from "react";
import { type PortfolioItemData, getPortfolioImageSrc } from "./types";
import Button from "@/components/Button/Button";

interface PortfolioCardProps {
  item: PortfolioItemData;
  isActive?: boolean;
  onSelect?: MouseEventHandler<HTMLButtonElement>;
}

export default function PortfolioCard({
  item,
  isActive = false,
  onSelect,
}: PortfolioCardProps) {
  const {
    title,
    description,
    category,
    client,
    technologies = [],
  } = item;

  const imageSrc = getPortfolioImageSrc(item);

  const link = item.projectUrl || item.url;

  const cardClasses = [
    "snap-center shrink-0 w-[90vw] sm:w-[510px] lg:w-[640px]",
    "bg-bg rounded-3xl border border-white/10 shadow-[0_25px_65px_-25px_rgba(15,15,35,0.9)]",
    "transition-all duration-500 ease-out hover:border-accent/40 text-left",
    isActive ? "ring-2 ring-accent shadow-accent/20" : "ring-1 ring-white/5",
  ]
    .filter(Boolean)
    .join(" ");

  const cardContent = (
    <>
      <div className="relative overflow-hidden rounded-t-3xl h-64 bg-gradient-to-br from-bg2 to-bg">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text/60 text-sm uppercase tracking-[0.2em]">
            Preview coming soon
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {category && (
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70 mb-2">
              {category}
            </p>
          )}
          <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
          {client && (
            <p className="text-sm text-white/70 mt-1">Client: {client}</p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {description && (
          <p className="text-text/90 leading-relaxed">{description}</p>
        )}

        {technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs text-accent">
            {technologies.map((tech) => (
              <li
                key={`${item.slug ?? title}-${tech}`}
                className="px-3 py-1 rounded-full border border-accent/30 bg-accent/5"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        {link && (
          <Button
            variant="link"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            rightIcon="lu:arrow-right"
            className="text-primary font-semibold"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            View Project
          </Button>
        )}
      </div>
    </>
  );

  // Use semantic button when interactive, otherwise a div for static display
  if (onSelect) {
    return (
      <button
        type="button"
        className={cardClasses}
        onClick={onSelect}
        aria-label={`Select ${title} project${category ? ` in ${category}` : ""}`}
      >
        {cardContent}
      </button>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}
