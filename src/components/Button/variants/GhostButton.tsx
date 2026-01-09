// src/components/Button/variants/GhostButton.tsx
/**
 * Ghost Button Variant - Koi Crest Style
 * 
 * Transparent button that shows background on hover.
 * Uses subtle gray colors that work with both light and dark sections.
 * Used for tertiary actions or when subtle interaction is needed.
 */

import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

export default function GhostButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  // Koi Crest ghost styling - transparent with subtle hover
  const variantClasses = 'inline-flex items-center gap-2 bg-transparent text-gray-700 px-8 py-4 text-lg rounded-md font-medium hover:bg-gray-100 transition duration-200';

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderButtonIcon(leftIcon, props.size)}
      rightIcon={renderButtonIcon(rightIcon, props.size)}
    />
  );
}