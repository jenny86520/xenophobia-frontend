import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { MetaLabel } from "@/components/brand/meta-label";
import type { IceEvent } from "@/types/ice-cream";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { describeIceEvent } from "@/utils/ice-cream-events";

/** Events that end a physical redemption carry the quip picked then. */
const QUIP_EVENTS = new Set(["redeemed_physical", "physical_confirmed", "physical_auto_confirmed"]);

/**
 * One token's events as hairline rows: the cup it had then (a small decorative icon, so a token that
 * changed cups shows a row of different cups), time (Taiwan), what happened and the quip it carries.
 */
export function IceEventList({ events, label }: { events: IceEvent[]; label: string }) {
  return (
    <ol aria-label={label} className="border-t border-line">
      {events.map((event) => (
        <li
          key={event.id}
          data-event-cup={event.cup?.name ?? "預設杯"}
          className="flex flex-col gap-1 border-b border-line py-4 md:flex-row md:items-baseline md:gap-6"
        >
          <span className="flex shrink-0 items-center gap-3 md:w-48">
            <IceCreamIcon className="size-6 text-ink-secondary" look={event.cup} />
            <MetaLabel>{formatTaipeiDateTime(event.createdAt)}</MetaLabel>
          </span>
          <span className="text-body text-ink">
            {describeIceEvent(event)}
            {event.note && QUIP_EVENTS.has(event.type) && (
              <span className="text-ink-secondary">：「{event.note}」</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
