import { cn } from "@/lib/utils";

type PlaceholderProps = {
  /** Stable key for `npm run check:content`, e.g. "brand.tagline". */
  name: string;
  /** What is missing, shown after 「待提供：」. */
  label: string;
  className?: string;
  /** Inline variant for a missing word or line inside running text. */
  inline?: boolean;
};

/**
 * Marks content the backend has not provided yet (design §8). Never dressed up as
 * real content: dashed frame, PLACEHOLDER tag, and 「待提供：…」.
 */
export function Placeholder({ name, label, className, inline = false }: PlaceholderProps) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      data-placeholder={name}
      className={cn(
        "border border-dashed border-line-strong text-ink-muted",
        inline
          ? "inline-flex items-baseline gap-2 px-2 py-0.5 align-baseline"
          : "flex flex-col items-start justify-center gap-1 p-4",
        className,
      )}
    >
      <span className="font-mono text-meta tracking-[0.08em] uppercase">Placeholder</span>
      <span className="text-caption">待提供：{label}</span>
    </Tag>
  );
}
