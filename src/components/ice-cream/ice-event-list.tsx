import { MetaLabel } from "@/components/brand/meta-label";
import type { IceEvent } from "@/types/ice-cream";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { describeIceEvent } from "@/utils/ice-cream-events";

/** One token's events as hairline rows: time (Taiwan), what happened and the quip it carries. */
export function IceEventList({ events, label }: { events: IceEvent[]; label: string }) {
  return (
    <ol aria-label={label} className="border-t border-line">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 border-b border-line py-4 md:flex-row md:items-baseline md:gap-6"
        >
          <MetaLabel className="shrink-0 md:w-40">{formatTaipeiDateTime(event.createdAt)}</MetaLabel>
          <span className="text-body text-ink">
            {describeIceEvent(event)}
            {event.note && event.type === "redeemed_physical" && (
              <span className="text-ink-secondary">：「{event.note}」</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
