"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { isPopoverOpen } from "@/lib/popover";
import type { IceShowcaseItem } from "@/types/ice-cream";
import { iceCreamName } from "@/utils/ice-cream-events";

/** Fine pointers (a mouse) open a showcase card on hover; touch and keyboards use the button. */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * The ice creams a member shows beside their name in the scrim room (spec ice-creams 比賽室的冰炫風
 * 展示): small cups, each a button opening a native popover with the cup drawn large, its number,
 * the cup's name and who issued it. Clicking, tapping or Enter opens it without JavaScript and Esc
 * closes it; after hydration a mouse also opens it on hover and closes it on leaving. Decoration
 * only: the names and the roster around it never change. `idPrefix` keeps ids unique when one
 * player appears in several lists on the page.
 */
export function IceShowcaseStrip({ items, idPrefix }: { items?: IceShowcaseItem[]; idPrefix: string }) {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.(HOVER_QUERY);
    if (!query) return;
    const update = () => setHover(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  if (!items || items.length === 0) return null;
  return (
    <span className="relative z-10 inline-flex items-center gap-1" data-ice-showcase>
      {items.map((ice) => {
        const id = `${idPrefix}-${ice.id}`;
        const anchor = `--ice-${id}`;
        const name = iceCreamName(ice.serial);
        const toggle = (show: boolean) => {
          const card = document.getElementById(id);
          if (!card) return;
          const open = isPopoverOpen(card);
          if (show && !open) card.showPopover();
          if (!show && open) card.hidePopover();
        };
        return (
          <span key={ice.id} className="inline-flex">
            <button
              type="button"
              popoverTarget={id}
              aria-label={name}
              style={{ anchorName: anchor } as CSSProperties}
              onPointerEnter={hover ? () => toggle(true) : undefined}
              onPointerLeave={hover ? () => toggle(false) : undefined}
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-ink-secondary hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <IceCreamIcon className="size-5" look={ice.cup} />
            </button>
            <div
              id={id}
              popover="auto"
              role="dialog"
              aria-label={name}
              style={{ positionAnchor: anchor } as CSSProperties}
              className="ice-showcase-card"
            >
              <IceCreamIcon className="size-24 text-ink-secondary" look={ice.cup} />
              <span className="font-mono text-lead text-ink tabular-nums">{name}</span>
              <span className="text-caption text-ink-secondary">杯子：{ice.cup?.name ?? "預設杯"}</span>
              <span className="text-caption text-ink-secondary">{ice.issuerName} 發行</span>
            </div>
          </span>
        );
      })}
    </span>
  );
}
