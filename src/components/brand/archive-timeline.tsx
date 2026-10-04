import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ArchiveTimelineItem = {
  id: string;
  /** Large mono marker, e.g. a milestone year. */
  marker: string;
  /** Machine-readable value for <time>, when the marker is a date or time. */
  dateTime?: string;
  title: string;
  description?: ReactNode;
};

type ArchiveTimelineProps = {
  items: ArchiveTimelineItem[];
  /** Heading level of each entry title; follows the page outline. */
  titleAs?: "h3" | "h4";
  className?: string;
};

/**
 * Technical Archive timeline (design §5): oversized marker, a thin vertical rule,
 * then the entry. Renders items in the order given; callers sort.
 */
export function ArchiveTimeline({ items, titleAs: Title = "h3", className }: ArchiveTimelineProps) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-1 gap-y-2 border-l border-line py-6 pl-6 md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] md:gap-x-8 md:border-l-0 md:pl-0"
        >
          <time
            dateTime={item.dateTime}
            className="font-mono text-h2 leading-none tracking-tight text-ink tabular-nums"
          >
            {item.marker}
          </time>
          <div className="flex flex-col gap-2 md:border-l md:border-line md:pl-8">
            <Title className="font-heading text-h3 text-ink">{item.title}</Title>
            {item.description && <div className="max-w-[65ch] text-body text-ink-secondary">{item.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
