// src/components/Button/utils.tsx
/**
 * Button Utility Functions
 * 
 * Helper functions for rendering icons in buttons.
 * Handles string icon names (via Icon component) and React elements.
 */

import { isValidElement, type ReactNode } from 'react';
import Icon from '@/components/Icon';

/**
 * Renders an icon for use in a button
 * 
 * @param icon - Icon name (string), React element, or undefined
 * @param size - Button size (affects icon size)
 * @returns Rendered icon element or null
 */
export function renderButtonIcon(
  icon: string | ReactNode | undefined,
  size?: 'sm' | 'md' | 'lg'
): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'string') return <Icon icon={icon} size={size} />;
  return null;
}