import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetaLabelProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Technical Archive metadata (e.g. `RESULTS / 02`): mono, uppercase, wide tracking, muted.
 * Only for values derived from real data, never decorative system messages.
 */
export function MetaLabel({ children, className, id }: MetaLabelProps) {
  return <span id={id} className={cn("font-mono text-meta text-ink-muted uppercase", className)}>{children}</span>;
}

/** Zero-padded count for metadata labels: 2 -> "02". */
export function formatCount(count: number): string {
  return String(count).padStart(2, "0");
}
