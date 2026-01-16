// src/components/project/Carousels/CarouselArrows.tsx
import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from "react";

interface CarouselArrowProps extends ComponentPropsWithoutRef<"button"> {
  direction?: "left" | "right";
  variant?: "floating" | "inline" | "custom" | string;
  position?: CSSProperties;
  iconClassName?: string;
}

const ChevronLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 320 512"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
  </svg>
);

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 320 512"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
  </svg>
);

const variantClassMap: Record<string, string> = {
  floating:
    "absolute z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-heading/10 border border-heading/20 text-text backdrop-blur-sm hover:bg-heading/20 transition hover:border-heading/75",
  inline:
    "w-10 h-10 md:w-12 md:h-12 rounded-full faded-bg text-text backdrop-blur-sm transition hover:bg-heading/20 hover:border-heading/50",
};

const defaultIconClasses = "mx-auto my-auto w-4.5 h-4.5 md:w-6 md:h-6";

const CarouselArrow = ({
  direction = "left",
  variant = "floating",
  position,
  className = "",
  iconClassName,
  disabled,
  ...props
}: CarouselArrowProps) => {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;
  const label = direction === "left" ? "Previous" : "Next";
  const variantClass =
    variant === "custom"
      ? className
      : variantClassMap[variant] || `${variant} ${className}`.trim();

  const buttonStyle = position
    ? ({
        left: position.left,
        right: position.right,
        top: position.top ?? "50%",
        transform: position.transform ?? "translate(-50%, -50%)",
        ...position,
      } satisfies CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      aria-label={label}
      className={variantClass}
      style={buttonStyle}
      disabled={disabled}
      {...props}
    >
      <Icon className={iconClassName || defaultIconClasses} />
    </button>
  );
};

export const LeftArrow = (props: Omit<CarouselArrowProps, "direction">) => (
  <CarouselArrow direction="left" {...props} />
);

export const RightArrow = (props: Omit<CarouselArrowProps, "direction">) => (
  <CarouselArrow direction="right" {...props} />
);

interface ArrowPairProps {
  onPrevious: () => void;
  onNext: () => void;
  variant?: CarouselArrowProps["variant"];
  className?: string;
  leftProps?: Partial<CarouselArrowProps>;
  rightProps?: Partial<CarouselArrowProps>;
  disabled?: boolean;
  children?: ReactNode;
}

export const ArrowPair = ({
  onPrevious,
  onNext,
  variant = "inline",
  className = "",
  leftProps = {},
  rightProps = {},
  disabled = false,
  children,
}: ArrowPairProps) => (
  <div className={`flex items-center justify-between ${className}`.trim()}>
    <LeftArrow
      onClick={onPrevious}
      variant={variant}
      disabled={disabled}
      {...leftProps}
    />
    {children}
    <RightArrow
      onClick={onNext}
      variant={variant}
      disabled={disabled}
      {...rightProps}
    />
  </div>
);

export default CarouselArrow;
