import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetaLabelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Technical Archive metadata (e.g. `RESULTS / 02`): monospace, uppercase, wide tracking, muted.
 * Only use it for values derived from real data, never for decorative system messages.
 */
export function MetaLabel({ children, className }: MetaLabelProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Zero-padded count for metadata labels: 2 -> "02". */
export function formatCount(count: number): string {
  return String(count).padStart(2, "0");
}
