// src/components/LoopComponents/AccordionItem.tsx
import type { ReactNode } from 'react';

export interface AccordionItemProps {
  id: string;
  title: string;
  description?: string;
  children?: ReactNode | string; // Can be plain text or HTML string
  isExpanded: boolean;
  onToggle: () => void;
  headerAction?: ReactNode;
}

function isHTMLString(str: string): boolean {
  // Check if string contains HTML tags
  return /<[a-z][\s\S]*>/i.test(str);
}

export default function AccordionItem({
  id,
  title,
  description,
  children,
  isExpanded,
  onToggle,
  headerAction,
}: AccordionItemProps) {
  // Determine how to render children
  const isHTML = typeof children === 'string' && isHTMLString(children);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
        role="button"
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

        {headerAction && (
          <div className="ml-4" onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        )}
      </div>

      {isExpanded && children && (
        <div
          id={`${id}-content`}
          className="p-6 bg-white border-t border-gray-300"
          aria-labelledby={id}
        >
          <div className="prose prose-gray max-w-none">
            {isHTML ? (
              // Render HTML string safely
              <div dangerouslySetInnerHTML={{ __html: children as string }} />
            ) : typeof children === 'string' ? (
              // Render plain text with preserved line breaks
              <div className="whitespace-pre-wrap">{children}</div>
            ) : (
              // Render React nodes as-is
              children
            )}
          </div>
        </div>
      )}
    </div>
  );
}