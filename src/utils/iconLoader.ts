// src/utils/iconLoader.ts
/**
 * Minimal icon loader that only imports the icons we actually use.
 * This avoids pulling entire icon libraries into a single chunk.
 */

import { isValidElement, type ReactNode, createElement } from 'react';
import {
  LuArrowRight,
  LuChevronRight,
  LuContact,
  LuMail,
  LuPhone,
  LuCode,
  LuShield,
  LuGlobe,
  LuBot,
  LuBrain,
  LuPalette,
  LuMegaphone,
  LuType,
  LuUsers,
  LuShoppingBag,
  LuCalendarClock,
  LuServer,
  LuWorkflow,
  LuLightbulb,
  LuTarget,
  LuMousePointer,
  LuGraduationCap,
  LuNewspaper,
  LuPackage,
  LuSparkles,
  LuTrendingUp,
  LuSearch,
  LuMonitorPlay,
  LuMessageSquare,
  LuShare2,
  LuThumbsUp,
  LuTable,
  LuCamera,
  LuLayoutDashboard,
  LuCloud,
  LuRepeat,
  LuGithub,
  LuLinkedin,
  LuTwitter,
} from 'react-icons/lu';
import {
  FaCaretRight,
  FaBullhorn,
  FaChartBar,
  FaPhone,
} from 'react-icons/fa';

export const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSizeMap;

export interface IconRenderOptions {
  size: IconSize;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

const iconRegistry: Record<string, any> = {
  // Lucide
  'lu:arrow-right': LuArrowRight,
  'lu:chevron-right': LuChevronRight,
  'lu:contact': LuContact,
  'lu:mail': LuMail,
  'lu:phone': LuPhone,
  'lu:code': LuCode,
  'lu:shield': LuShield,
  'lu:globe': LuGlobe,
  'lu:bot': LuBot,
  'lu:brain': LuBrain,
  'lu:palette': LuPalette,
  'lu:megaphone': LuMegaphone,
  'lu:type': LuType,
  'lu:users': LuUsers,
  'lu:shopping-bag': LuShoppingBag,
  'lu:calendar-clock': LuCalendarClock,
  'lu:server': LuServer,
  'lu:workflow': LuWorkflow,
  'lu:lightbulb': LuLightbulb,
  'lu:target': LuTarget,
  'lu:mouse-pointer': LuMousePointer,
  'lu:graduation-cap': LuGraduationCap,
  'lu:newspaper': LuNewspaper,
  'lu:package': LuPackage,
  'lu:sparkles': LuSparkles,
  'lu:trending-up': LuTrendingUp,
  'lu:search': LuSearch,
  'lu:monitor-play': LuMonitorPlay,
  'lu:message-square': LuMessageSquare,
  'lu:share-2': LuShare2,
  'lu:thumbs-up': LuThumbsUp,
  'lu:table': LuTable,
  'lu:camera': LuCamera,
  'lu:layout-dashboard': LuLayoutDashboard,
  'lu:cloud': LuCloud,
  'lu:repeat': LuRepeat,
  'lu:github': LuGithub,
  'lu:linkedin': LuLinkedin,
  'lu:twitter': LuTwitter,

  // Font Awesome (limited)
  'fa:caret-right': FaCaretRight,
  'fa:bullhorn': FaBullhorn,
  'fa:chart-bar': FaChartBar,
  'fa:phone': FaPhone,
};

const normalizeKey = (icon: string) =>
  icon.includes(':') ? icon.toLowerCase() : `lu:${icon.toLowerCase()}`;

export function isEmoji(str: string): boolean {
  return /[\u{1F300}-\u{1FAD6}]/u.test(str) || (str.length <= 2 && !/^[a-zA-Z0-9]+$/.test(str));
}

export function isValidIconString(icon: string): boolean {
  if (!icon || typeof icon !== 'string') return false;
  if (isEmoji(icon)) return true;
  return /^([a-z0-9-]+:)?[a-z0-9-]+$/i.test(icon);
}

function renderEmojiIcon(icon: string, options: IconRenderOptions): ReactNode {
  const { size, className = '', color, ariaLabel } = options;

  return createElement('span', {
    className: `inline-flex items-center justify-center ${className}`,
    style: { fontSize: iconSizeMap[size], color },
    role: 'img',
    'aria-label': ariaLabel,
    children: icon,
  });
}

export function renderStringIcon(icon: string, options: IconRenderOptions): ReactNode {
  if (isEmoji(icon)) {
    return renderEmojiIcon(icon, options);
  }

  if (!isValidIconString(icon)) {
    console.warn(`Invalid icon string: ${icon}`);
    return null;
  }

  const Component = iconRegistry[normalizeKey(icon)];

  if (!Component) {
    console.warn(`Icon not found: ${icon}`);
    return null;
  }

  const { size, className = '', color, ariaLabel } = options;

  return createElement(Component, {
    size: iconSizeMap[size],
    className,
    color,
    'aria-label': ariaLabel,
  });
}

export function renderObjectIcon(icon: any, options: IconRenderOptions): ReactNode {
  const { size, className = '', color, ariaLabel } = options;
  const sizeValue = iconSizeMap[size];

  if ('src' in icon) {
    return createElement('img', {
      src: icon.src,
      alt: ariaLabel || '',
      className,
      width: sizeValue,
      height: sizeValue,
      style: { color },
    });
  }

  if ('type' in icon) {
    switch (icon.type) {
      case 'svg':
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { width: sizeValue, height: sizeValue, color },
          dangerouslySetInnerHTML: { __html: icon.content },
          'aria-label': ariaLabel,
        });
      case 'emoji':
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { fontSize: sizeValue, color },
          role: 'img',
          'aria-label': ariaLabel,
          children: icon.content,
        });
      case 'text':
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { fontSize: sizeValue, color },
          children: icon.content,
        });
    }
  }

  return null;
}

export function renderIcon(icon: any, options: IconRenderOptions): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'string') return renderStringIcon(icon, options);
  if (typeof icon === 'object') return renderObjectIcon(icon, options);
  return null;
}

export function getIconName(icon: string, library = 'lu') {
  return icon.includes(':') ? icon : `${library}:${icon}`;
}
