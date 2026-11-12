import { BrandName } from "@/components/brand/brand-name";
import { cn } from "@/lib/utils";

/** Odd rows travel right, even rows left; the middle row is outlined. */
const ROWS = [{ outline: false }, { outline: true }, { outline: false }] as const;

/**
 * Between Hero and Statement: three oversized wordmark rows that slide in opposite directions as
 * the band scrolls past (`.marquee-row`, a CSS view timeline; spec 品牌特效). Pure decoration, so
 * the whole band is hidden from assistive tech. Each row repeats the name so its edges never show
 * while it moves; without support or with reduced motion the rows simply stand still.
 *
 * `relative` is what keeps the band inside the page: BrandName's sr-only copy is absolutely
 * positioned, and overflow-clip only clips descendants whose containing block is the band or
 * inside it. Without it the copies far right in each row escaped (a 375px phone scrolled to
 * 820px); the animated rows hid this, because their `translate` made each row a containing block.
 */
export function BrandMarquee({ name }: { name: string }) {
  return (
    <div aria-hidden="true" data-brand-marquee className="marquee relative overflow-clip py-section-tight select-none">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className={cn(
            "marquee-row flex justify-center gap-[0.35em] font-sans text-display whitespace-nowrap uppercase",
            "text-[clamp(4rem,16vw,15rem)] leading-[0.95]",
            i % 2 === 1 ? "marquee-row-reverse" : null,
            row.outline ? "marquee-outline" : "text-ink-muted",
          )}
        >
          {[0, 1, 2].map((copy) => (
            <span key={copy}>
              <BrandName name={name} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
