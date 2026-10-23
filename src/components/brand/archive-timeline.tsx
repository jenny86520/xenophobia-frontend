import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ArchiveTimelineEntry = {
  id: string;
  title: string;
  description?: ReactNode;
};

export type ArchiveTimelineItem = {
  id: string;
  /** Large mono marker, e.g. a milestone year. */
  marker: string;
  /** Machine-readable value for <time>, when the marker is a date or time. */
  dateTime?: string;
  /** Everything under this marker, in order (several milestones on the same date share one row). */
  entries: ArchiveTimelineEntry[];
};

type ArchiveTimelineProps = {
  items: ArchiveTimelineItem[];
  /** Heading level of each entry title; follows the page outline. */
  titleAs?: "h3" | "h4";
  className?: string;
};

/**
 * Technical Archive timeline (design §5): oversized marker, a thin vertical rule,
 * then the entries for that marker. Renders items in the order given; callers sort and group.
 * A whole row highlights on hover (the marker turns signal red even when the pointer is on a
 * later entry) and rows rise in one by one while scrolling (`.archive-row`,
 * `.archive-row-reveal` in globals.css); rows are not interactive, so they never take focus.
 */
export function ArchiveTimeline({ items, titleAs: Title = "h3", className }: ArchiveTimelineProps) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="archive-row archive-row-reveal grid grid-cols-1 gap-y-2 border-l py-6 pr-4 pl-6 md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] md:gap-x-8 md:border-l-0 md:px-4"
        >
          <time
            dateTime={item.dateTime}
            className="archive-row-marker font-mono text-h2 leading-none tracking-tight tabular-nums"
          >
            {item.marker}
          </time>
          <div className="archive-row-body flex flex-col gap-6 md:border-l md:pl-8">
            {item.entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-2">
                <Title className="font-heading text-h3 text-ink">{entry.title}</Title>
                {entry.description && (
                  <div className="max-w-[65ch] text-body text-ink-secondary">{entry.description}</div>
                )}
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
