// src/components/LoopTemplates/Accordion.tsx
import { useState, useEffect, useRef } from "react";
import AccordionItem from "@/components/LoopComponents/AccordionItem";

interface AccordionItemData {
  slug?: string;
  title: string;
  description?: string;
  contentSlotId: string; // ID of the hidden div with rendered content
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = "",
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [itemsWithContent, setItemsWithContent] = useState<Array<AccordionItemData & { renderedContent: string }>>([]);

  // Grab rendered content from DOM on mount
  useEffect(() => {
    const processedItems = items.map(item => {
      const contentElement = document.getElementById(item.contentSlotId);
      return {
        ...item,
        renderedContent: contentElement ? contentElement.innerHTML : '',
      };
    });
    setItemsWithContent(processedItems);
  }, [items]);

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
      {itemsWithContent.map((item, index) => {
        const itemId = item.slug || `item-${index}`;
        
        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.title}
            description={item.description}
            isExpanded={expandedItems.has(itemId)}
            onToggle={() => toggleItem(itemId)}
          >
            {/* Render the pre-rendered HTML content */}
            <div dangerouslySetInnerHTML={{ __html: item.renderedContent }} />
          </AccordionItem>
        );
      })}
    </div>
  );
}