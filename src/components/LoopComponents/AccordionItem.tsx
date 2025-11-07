// src/components/LoopComponents/AccordionItem.tsx
import type { ReactNode } from 'react';

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
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <button
        type="button"
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors w-full text-left"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-gray-600 font-medium text-xl">
            {isExpanded ? '−' : '+'}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </button>

      {isExpanded && children && (
        <div
          id={`${id}-content`}
          className="p-6 bg-white border-t border-gray-300"
        >
          <div className="prose prose-gray max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}