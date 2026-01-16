// src/components/LoopTemplates/Accordion.tsx
import { useState, useEffect, useRef, type ReactNode } from "react";
import AccordionItem from "@/components/LoopComponents/AccordionItem";

interface AccordionItemData {
  slug?: string;
  title: string;
  description?: string;
  contentSlotId: string; // ID of the hidden div with rendered content
}

interface HeaderSlotParams {
  item: AccordionItemData;
  id: string;
  expanded: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
  headerSlot?: (params: HeaderSlotParams) => ReactNode;
  showIndicator?: boolean;
}

export default function Accordion({
  items,
  allowMultiple = false,
  className = "",
  headerSlot,
  showIndicator = true,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Load content ONLY when panel expands - lazy loading!
  useEffect(() => {
    expandedItems.forEach((itemId) => {
      const panel = panelRefs.current.get(itemId);
      const item = items.find((i, idx) => (i.slug || `item-${idx}`) === itemId);

      if (panel && item?.contentSlotId && panel.children.length === 0) {
        // Find the hidden content by ID
        const hiddenContent = document.getElementById(item.contentSlotId);

        if (hiddenContent) {
          // Clone the node (keeps original hidden div intact)
          const clone = hiddenContent.cloneNode(true) as HTMLElement;

          // Make it visible (remove display: none)
          clone.style.display = '';
          clone.removeAttribute('id'); // Remove ID to avoid duplicates

          // Append to panel
          panel.appendChild(clone);
        }
      }
    });
  }, [expandedItems, items]);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => {
        const itemId = item.slug || `item-${index}`;
        const isExpanded = expandedItems.has(itemId);

        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.title}
            isExpanded={isExpanded}
            onToggle={() => toggleItem(itemId)}
            headerSlot={headerSlot?.({ item, id: itemId, expanded: isExpanded })}
            showIndicator={showIndicator}
          >
            {/* Simple container - content gets cloned here when panel opens */}
            <div
              ref={(el) => {
                if (el) panelRefs.current.set(itemId, el);
              }}
            />
          </AccordionItem>
        );
      })}
    </div>
  );
}