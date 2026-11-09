import Link from "next/link";
import { cn } from "@/lib/utils";
import { LEGEND_TABS, legendTabHref, type LegendTab } from "@/utils/legend-tabs";

/**
 * The /legends tabs: links to ?tab= rendered on the server, so they work without JavaScript and can be
 * shared. A <nav> with aria-current (not an ARIA tablist); the current tab is marked by a rule and
 * bolder text, not colour alone. On narrow screens the row scrolls sideways instead of wrapping.
 */
export function LegendTabs({ current, tabs }: { current: LegendTab; tabs: LegendTab[] }) {
  return (
    <nav aria-label="傳奇榜分類" className="mb-section-tight overflow-x-auto">
      <ul className="flex min-w-max gap-x-8 border-b border-line">
        {LEGEND_TABS.filter((tab) => tabs.includes(tab.value)).map((tab) => {
          const active = tab.value === current;
          return (
            <li key={tab.value} className="shrink-0">
              <Link
                href={legendTabHref(tab.value)}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 border-b-2 py-3 text-body whitespace-nowrap",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset",
                  active
                    ? "border-signal font-medium text-ink"
                    : "border-transparent text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                <tab.icon aria-hidden="true" className="size-4 shrink-0" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
