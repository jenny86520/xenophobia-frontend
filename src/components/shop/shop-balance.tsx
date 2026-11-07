import { Coins } from "lucide-react";
import Link from "next/link";

/**
 * The member's points, floating at the top right just under the header while they browse the shop
 * (the header scrolls away; the back-to-top button holds the bottom right). A link to the 點數 tab.
 */
export function ShopBalance({ balance }: { balance: number }) {
  return (
    <Link
      href="/member?tab=points"
      className="fixed top-24 right-[calc(var(--container-gutter)+1rem)] z-40 inline-flex items-center gap-2 rounded-sm border border-line-strong bg-surface-elevated px-4 py-2 text-body text-ink transition-[border-color,box-shadow] duration-200 hover:border-signal hover:shadow-glow focus-visible:border-signal focus-visible:shadow-glow focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Coins aria-hidden="true" className="size-4 shrink-0 text-ink-secondary" />
      我的點數
      <span className="font-mono text-signal tabular-nums">{balance}</span>
    </Link>
  );
}
