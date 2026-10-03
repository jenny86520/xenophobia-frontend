import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" link (design D3). Visibility is pure CSS (`.back-to-top` in
 * globals.css): hidden near the top, fades in after scrolling; always shown without
 * scroll-driven animation support or with reduced motion. Targets the #top anchor
 * at the start of <body>.
 */
export function BackToTop() {
  return (
    <a
      href="#top"
      className="back-to-top fixed right-gutter bottom-4 z-40 inline-flex size-11 items-center justify-center rounded-sm border border-line-strong bg-surface-elevated text-ink transition-[border-color,box-shadow] duration-200 hover:border-signal hover:shadow-glow focus-visible:border-signal focus-visible:shadow-glow focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:bottom-6"
    >
      <ArrowUp aria-hidden="true" className="size-5" />
      <span className="sr-only">回到頁首</span>
    </a>
  );
}
