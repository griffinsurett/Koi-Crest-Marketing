// src/components/LoopTemplates/Accordion.tsx
import { useState } from "react";
import AccordionItem from "../LoopComponents/AccordionItem";

interface AccordionProps {
  items: Array<{
    slug?: string;
    title: string;
    description?: string;
    content?: string;  // Single field: HTML string or plain text
    headerAction?: React.ReactNode;
    [key: string]: any;
  }>;
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = "",
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const itemId = item.slug || item.title;
        const displayContent = item.content || item.description;
        const subtitle = item.content ? item.description : undefined;

        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.title}
            description={subtitle}
            isExpanded={expandedItems.has(itemId)}
            onToggle={() => toggleItem(itemId)}
            headerAction={item.headerAction}
          >
            {displayContent}
          </AccordionItem>
        );
      })}
    </div>
  );
}