import { formatCount } from "@/components/brand/meta-label";
import type { Highlight } from "@/types/about";
import { HighlightIcon } from "./highlight-icon";

/**
 * The /about highlights as hairline-ruled rows led by their icon: a small mono index, a large
 * icon in a thin square frame as the visual anchor, then the title and content as supporting
 * text. Rows are not interactive. Callers handle the empty case.
 */
export function HighlightList({ highlights }: { highlights: Highlight[] }) {
  return (
    <ol className="border-b border-line">
      {highlights.map((item, index) => (
        <li key={item.id} className="flex items-start gap-5 border-t border-line py-6 md:gap-6">
          <span className="w-6 shrink-0 pt-1 font-mono text-meta text-signal">{formatCount(index + 1)}</span>
          <span className="flex size-16 shrink-0 items-center justify-center rounded-sm border border-line text-ink">
            <HighlightIcon code={item.icon} className="size-8" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 pt-1">
            {item.title && <h3 className="font-heading text-lead text-ink">{item.title}</h3>}
            {item.content && (
              <p className="max-w-[65ch] text-caption whitespace-pre-line text-ink-secondary">{item.content}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
