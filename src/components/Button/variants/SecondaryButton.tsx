// src/components/Button/variants/SecondaryButton.tsx
/**
 * Secondary Button Variant - Koi Crest Style
 * 
 * White button with dark border.
 * Uses white background with MainDark text and border.
 * Used for secondary actions that need less emphasis than primary buttons.
 */

import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

export default function SecondaryButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  // Koi Crest secondary styling - white background with dark border
  const variantClasses = 'hover-scale-up-center inline-flex items-center gap-2 bg-white text-MainDark px-8 py-4 text-lg font-medium rounded-md transition duration-200';

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderButtonIcon(leftIcon, props.size)}
      rightIcon={renderButtonIcon(rightIcon, props.size)}
    />
  );
}