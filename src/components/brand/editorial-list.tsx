"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { formatCount } from "./meta-label";
import { Placeholder } from "./placeholder";

export type EditorialListItem = {
  id: string;
  title: string;
  /** One line shown in the row itself; a placeholder is shown when empty. */
  summary: string;
  /** Longer text revealed on expand; a placeholder is shown when empty. */
  description: string;
  /** Prefix for data-placeholder keys: "<key>.summary" / "<key>.description". */
  placeholderKey: string;
};

type EditorialListProps = {
  items: EditorialListItem[];
  /** What a missing summary / description is called, e.g. "遊戲短述" / "遊戲說明". */
  summaryLabel: string;
  descriptionLabel: string;
  className?: string;
};

/**
 * Numbered editorial rows (design §5, §7): 01 / title / summary, expandable for the
 * full description. Each row is a native <button> (Radix Accordion), so Enter / Space work.
 */
export function EditorialList({ items, summaryLabel, descriptionLabel, className }: EditorialListProps) {
  return (
    <Accordion type="multiple" className={cn("border-b border-line", className)}>
      {items.map((item, index) => (
        <AccordionItem key={item.id} value={item.id} className="list-row border-t border-line not-last:border-b-0">
          <AccordionTrigger className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 rounded-none border-0 px-2 py-6 text-base font-normal hover:no-underline focus-visible:ring-offset-0 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-x-6">
            <span className="list-row-index font-mono text-meta text-ink-muted transition-colors">
              {formatCount(index + 1)}
            </span>
            <span className="font-heading text-h3 text-ink">{item.title}</span>
            <span className="col-start-2 text-body text-ink-secondary md:col-start-auto">
              {item.summary || <Placeholder name={`${item.placeholderKey}.summary`} label={summaryLabel} inline />}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pl-[calc(3rem+1rem+0.5rem)] text-body text-ink-secondary md:pl-[calc(4rem+1.5rem+0.5rem)]">
            {item.description ? (
              <p className="max-w-[65ch] whitespace-pre-line">{item.description}</p>
            ) : (
              <Placeholder name={`${item.placeholderKey}.description`} label={descriptionLabel} className="max-w-[65ch]" />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
