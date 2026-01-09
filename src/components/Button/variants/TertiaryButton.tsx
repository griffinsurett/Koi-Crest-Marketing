// src/components/Button/variants/TertiaryButton.tsx
/**
 * Tertiary Button Variant - Gray Button
 * 
 * Gray background button for tertiary actions.
 * Renders as <button> or <a> based on href prop.
 */

import { forwardRef } from 'react';
import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

const TertiaryButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ leftIcon, rightIcon, size = 'md', children, className = '', ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      bg-gray-200 text-MainDark
      hover:bg-MainDark hover:text-MainLight
      transition-colors duration-200 rounded-md
      focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    `;

    const sizeStyles = {
      sm: 'px-6 py-3 text-base',
      md: 'px-8 py-4 text-lg',
      lg: 'px-10 py-5 text-xl',
    };

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${className}`.trim();

    return (
      <ButtonBase
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {leftIcon && renderButtonIcon(leftIcon, size)}
        {children}
        {rightIcon && renderButtonIcon(rightIcon, size)}
      </ButtonBase>
    );
  }
);

TertiaryButton.displayName = 'TertiaryButton';

export default TertiaryButton;