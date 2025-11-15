// src/components/LoopComponents/Menu/MobileMenuItem.tsx
/**
 * Mobile Menu Item Component
 * 
 * Collapsible menu item for mobile navigation.
 * Accessible navigation pattern with proper ARIA.
 */

import { useState } from 'react';

interface MobileMenuItemProps {
  title: string;
  url?: string;
  slug: string;
  children?: any[];
  openInNewTab?: boolean;
  onNavigate: () => void;
  level?: number;
}

export default function MobileMenuItem({ 
  title, 
  url, 
  slug,
  children = [],
  openInNewTab = false,
  onNavigate,
  level = 0,
}: MobileMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = children.length > 0;
  const indent = level * 16; // 16px per level
  
  if (hasChildren) {
    return (
      <li>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left py-3 px-4 flex justify-between items-center hover:bg-gray-50 rounded-md transition-colors"
          aria-expanded={isExpanded}
          aria-controls={`mobile-submenu-${slug}`}
          style={{ paddingLeft: `${indent + 16}px` }}
          type="button"
        >
          <span className="font-medium text-gray-900">{title}</span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <ul 
            id={`mobile-submenu-${slug}`}
            className="mt-1 space-y-1"
          >
            {children.map(child => (
              <MobileMenuItem 
                key={child.slug || child.id}
                {...child} 
                onNavigate={onNavigate}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
  
  return (
    <li>
      <a 
        href={url || '#'} 
        onClick={onNavigate}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
        style={{ paddingLeft: `${indent + 16}px` }}
      >
        {title}
      </a>
    </li>
  );
}