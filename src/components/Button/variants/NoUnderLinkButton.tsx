// src/components/Button/variants/LinkButton.tsx
/**
 * Link Button Variant - Koi Crest Style
 * 
 * Styled as an underlined text link rather than a button.
 * Uses MainDark color for links with pink accent on hover (matching Privacy Policy links).
 * Can still render as either <a> or <button> based on href.
 */

import type { ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

export default function LinkButton({
  leftIcon,
  rightIcon,
  className = '',
  size = 'md',
  href,
  children,
  ...props
}: ButtonProps) {
  // Koi Crest link styling - dark text with pink hover and underline
  const baseClasses = `inline-flex items-center gap-2 text-MainDark hover:text-pink-600 hover:underline font-medium transition duration-200 ${className}`.trim();

  // Render as anchor if href provided
  if (href) {
    return (
      <a 
        href={href} 
        className={baseClasses} 
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {renderButtonIcon(leftIcon, size)}
        {children}
        {renderButtonIcon(rightIcon, size)}
      </a>
    );
  }

  // Render as button otherwise
  return (
    <button 
      className={baseClasses} 
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {renderButtonIcon(leftIcon, size)}
      {children}
      {renderButtonIcon(rightIcon, size)}
    </button>
  );
}