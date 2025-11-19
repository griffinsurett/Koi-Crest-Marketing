// src/components/LoopComponents/AccordionItem.tsx
import type { ReactNode } from 'react';
import Icon from '../Icon';

export interface AccordionItemProps {
  id: string;
  title: string;
  description?: string;
  children?: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AccordionItem({
  id,
  title,
  description,
  children,
  isExpanded,
  onToggle,
}: AccordionItemProps) {
  return (
    <div className="overflow-hidden bg-gray-200">
      <button
        type="button"
        className="flex items-center justify-between p-4 cursor-pointer w-full text-left"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
      >
        <div className="flex-1 pr-4">
          <span className="h4 font-medium text-gray-700 text-base">{title}</span>
        </div>
        
        <Icon
          icon="fa:caret-right"
          size="md"
          className={`text-gray-500 ${isExpanded ? 'transform rotate-90' : ''} transition-transform duration-200`}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        />
      </button>

      {isExpanded && children && (
        <div
          id={`${id}-content`}
          className="px-5 md:px-6 py-3 bg-white"
        >
          <div className="prose prose-gray max-w-none text-gray-600 text-sm md:text-base">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}