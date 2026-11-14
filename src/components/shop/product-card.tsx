import { Check, CircleSlash } from "lucide-react";
import type { ReactNode } from "react";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { MetaLabel } from "@/components/brand/meta-label";
import { Heading } from "@/components/brand/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  /** Id of the product name, which names the card. */
  id: string;
  name: string;
  /** 「免費」, 「3 點」… */
  price: string;
  /** Conditions under the price (each limit or date). */
  terms: string[];
  /** Claim button, 「已兌換」, a sign-in or a go-and-create link. */
  action: ReactNode;
  /** The product picture (an aria-hidden icon); the ice cream icon when left out. */
  picture?: ReactNode;
  /** A coloured label on the picture, such as 「期間限定」 or 「限量 20 份」 (text, never colour alone). */
  tag?: string;
  /** A limited item's copies: what is left of the limit, shown as a meter under the price. */
  stock?: { remaining: number; limit: number };
  /** Every copy is sold: the picture dims and carries 已售完. */
  soldOut?: boolean;
};

/**
 * 「剩 3 / 20 份」 in large figures with a thin bar of what is left. The text is what assistive tech
 * reads; the bar is decoration (aria-hidden), so colour is never the only signal.
 */
function StockMeter({
  remaining,
  limit,
}: {
  remaining: number;
  limit: number;
}) {
  const left = Math.max(0, Math.min(remaining, limit));
  const percent = limit > 0 ? Math.round((left / limit) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5" data-stock-meter>
      <p className="flex items-baseline justify-between gap-3 text-caption text-ink-secondary">
        <span>剩餘</span>
        <span className="font-mono tabular-nums">
          <span
            className={cn(
              "text-lead",
              left === 0 ? "text-ink-muted" : "text-ink",
            )}
          >
            {left}
          </span>{" "}
          / {limit} 份
        </span>
      </p>
      <span
        aria-hidden="true"
        className="block h-1 w-full overflow-hidden rounded-sm bg-line"
      >
        <span
          className="block h-full bg-signal"
          style={{ width: `${percent}%` }}
        />
      </span>
    </div>
  );
}

/**
 * One product on the shop shelf: a square card with the product picture (and an optional coloured
 * tag such as 期間限定 or 限量, and for limited items a stock meter along its bottom edge) on top, then
 * name, price, terms and the action. A sold-out item keeps its place with a dimmed picture and 已售完 in place of its action.
 * The square is a preferred size: when a narrow card cannot fit its text it grows taller instead of
 * cutting anything off.
 */
export function ProductCard({
  id,
  name,
  price,
  terms,
  action,
  picture,
  tag,
  stock,
  soldOut = false,
}: ProductCardProps) {
  return (
    <li
      aria-labelledby={id}
      data-sold-out={soldOut || undefined}
      className="flex aspect-square flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div
        className={cn(
          "relative flex min-h-32 flex-1 items-center justify-center border-b border-line-subtle bg-surface-elevated px-4 py-8 text-ink-secondary",
          stock && "pb-16",
        )}
      >
        <div
          className={cn(
            "flex scale-110 items-center justify-center",
            soldOut && "opacity-40 grayscale",
          )}
        >
          {picture ?? <IceCreamIcon className="size-14" />}
        </div>
        {tag && <Badge className="absolute top-3 left-3">{tag}</Badge>}
        {stock && (
          <div className="absolute inset-x-4 bottom-3">
            <StockMeter {...stock} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span id={id} className="text-lead text-ink">
              {name}
            </span>
            <span
              className={cn(
                "shrink-0 font-mono text-lead tabular-nums",
                soldOut ? "text-ink-muted" : "text-signal",
              )}
            >
              {price}
            </span>
          </div>
          <MetaLabel>{terms.join("・")}</MetaLabel>
        </div>
        <div className="border-t border-line-subtle pt-3">{action}</div>
      </div>
    </li>
  );
}

/**
 * A card's settled state in place of its button: done (已擁有, 已兌換, 已領取) with a check, or
 * 已售完 with a slashed circle. The word carries the meaning; the icon is decoration.
 */
export function ShelfStatus({
  kind,
  children,
}: {
  kind: "done" | "soldOut";
  children: ReactNode;
}) {
  const Icon = kind === "done" ? Check : CircleSlash;
  return (
    <span className="inline-flex items-center gap-2 text-body text-ink-secondary">
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4",
          kind === "done" ? "text-signal" : "text-ink-muted",
        )}
      />
      {children}
    </span>
  );
}

/**
 * A grid of product cards named by a heading: one card per row on phones, up to four side by side
 * on wide screens.
 */
export function ProductGrid({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <ul
      aria-labelledby={labelledBy}
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {children}
    </ul>
  );
}

/**
 * One shelf of the shop under its own heading, which names the list. With `grid={false}` the shelf
 * holds its own content (the cosmetics' tabs and sections) instead of one grid of cards.
 */
export function ProductShelf({
  id,
  title,
  grid = true,
  children,
}: {
  id: string;
  title: string;
  grid?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col">
      <Heading level={2} id={id}>
        {title}
      </Heading>
      {grid ? <ProductGrid labelledBy={id}>{children}</ProductGrid> : children}
    </section>
  );
}
