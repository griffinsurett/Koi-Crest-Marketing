// src/components/Button/variants/PrimaryButton.tsx
/**
 * Primary Button Variant - Koi Crest Style
 * 
 * Solid dark button - the default and most prominent button style.
 * Uses MainDark background with MainLight text.
 * Used for primary actions like form submissions, main CTAs.
 */

import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

/**
 * Primary button with MainDark background and MainLight text
 */
export default function PrimaryButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  // Koi Crest primary styling - dark background
  const variantClasses = 'hover-scale-up-center bg-MainDark text-MainLight inline-flex justify-center items-center gap-2 bg-black text-white px-8 py-4 text-lg font-medium rounded-md hover:bg-gray-800 transition duration-200';

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderButtonIcon(leftIcon, props.size)}
      rightIcon={renderButtonIcon(rightIcon, props.size)}
    />
  );
}