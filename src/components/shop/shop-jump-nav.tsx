import { Fragment } from "react";
import { TextLink } from "@/components/brand/text-link";

const SHELVES = [
  { id: "shelf-ice-creams", label: "冰炫風" },
  { id: "shelf-tasks", label: "點數任務" },
  { id: "shelf-cosmetics", label: "外觀" },
] as const;

/**
 * The shop's in-page links to its three shelves (spec point-shop), under the page header: plain
 * anchors, so they work without JavaScript, wrapping on narrow screens rather than scrolling.
 */
export function ShopJumpNav() {
  return (
    <nav aria-label="商店分類" className="mt-6">
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-body text-ink-secondary">
        {SHELVES.map((shelf, index) => (
          <Fragment key={shelf.id}>
            {index > 0 && (
              <li aria-hidden="true" className="text-signal">
                ・
              </li>
            )}
            <li>
              <TextLink href={`#${shelf.id}`}>{shelf.label}</TextLink>
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  );
}
