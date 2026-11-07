import type { ReactNode } from "react";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { MetaLabel } from "@/components/brand/meta-label";
import { Badge } from "@/components/ui/badge";

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
  /** A coloured label on the picture, such as 「期間限定」 (text, never colour alone). */
  tag?: string;
};

/**
 * One product on the shop shelf: a square card with the product picture (and an optional coloured
 * tag such as 期間限定) on top, then name, price, terms and the action. The square is a preferred size: when a narrow card
 * cannot fit its text it grows taller instead of cutting anything off.
 */
export function ProductCard({ id, name, price, terms, action, picture, tag }: ProductCardProps) {
  return (
    <li aria-labelledby={id} className="flex aspect-square flex-col rounded-sm border border-line bg-surface">
      <div className="relative flex min-h-24 flex-1 items-center justify-center border-b border-line-subtle text-ink-secondary">
        {picture ?? <IceCreamIcon className="size-14" />}
        {tag && <Badge className="absolute top-3 left-3">{tag}</Badge>}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <span id={id} className="text-lead text-ink">
          {name}
        </span>
        <span className="font-mono text-lead text-signal">{price}</span>
        <MetaLabel>{terms.join("・")}</MetaLabel>
        <div className="mt-2">{action}</div>
      </div>
    </li>
  );
}

/** The shelf: one card per row on phones, up to four side by side on wide screens. */
export function ProductShelf({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </ul>
  );
}
