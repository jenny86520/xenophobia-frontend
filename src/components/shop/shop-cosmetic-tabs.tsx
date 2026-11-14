import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  type CosmeticGroup,
  type ShopCategoryTab,
  shopCosmeticsHref,
} from "@/utils/shop-cosmetics";

/**
 * The cosmetics shelf's tabs (spec point-shop): 全部, then one per category with items (the admins'
 * order, 其他 last), each with its item count, as links rendered on the server, so they work
 * without JavaScript. Like the /legends tabs: a <nav> with aria-current, the current tab marked by a
 * rule and bolder text, scrolling sideways when narrow. A signed-in member also gets the
 * 隱藏已擁有 / 顯示已擁有 link; every link keeps the other setting and lands on the shelf.
 */
export function ShopCosmeticTabs({
  groups,
  current,
  hideOwned,
  signedIn,
}: {
  /** Every group with items, before hiding owned ones (the counts never change with the toggle). */
  groups: CosmeticGroup<unknown>[];
  current: ShopCategoryTab;
  hideOwned: boolean;
  signedIn: boolean;
}) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const tabs = [
    { key: "all", label: "全部", count: total },
    ...groups.map((g) => ({ ...g, count: g.items.length })),
  ];
  const ToggleIcon = hideOwned ? Eye : EyeOff;

  return (
    <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line">
      <nav aria-label="外觀分類" className="-mb-px max-w-full overflow-x-auto">
        <ul className="flex min-w-max gap-x-8">
          {tabs.map((tab) => {
            const active = tab.key === current;
            return (
              <li key={tab.key} className="shrink-0">
                <Link
                  href={shopCosmeticsHref(tab.key, hideOwned)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-baseline gap-2 border-b-2 py-3 text-body whitespace-nowrap",
                    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset",
                    active
                      ? "border-signal font-medium text-ink"
                      : "border-transparent text-ink-secondary hover:border-line-strong hover:text-ink",
                  )}
                >
                  {tab.label}{" "}
                  <span className="font-mono text-label text-ink-muted tabular-nums">
                    {tab.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {signedIn && (
        <Link
          href={shopCosmeticsHref(current, !hideOwned)}
          scroll={false}
          className="link-with-icon mb-3 inline-flex items-center gap-2 text-caption text-ink-secondary hover:text-ink"
        >
          <ToggleIcon aria-hidden="true" className="size-[0.9em] shrink-0" />
          <span className="link-underline">
            {hideOwned ? "顯示已擁有" : "隱藏已擁有"}
          </span>
        </Link>
      )}
    </div>
  );
}
