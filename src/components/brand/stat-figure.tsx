import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MetaLabel } from "./meta-label";

type StatFigureProps = {
  label: string;
  /** The figure; pass a Placeholder when the value is not available. */
  value: ReactNode;
  className?: string;
};

/** A large data-derived figure with its metadata label, separated by a hairline. */
export function StatFigure({ label, value, className }: StatFigureProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-t border-line pt-3 pb-1", className)}>
      <dt>
        <MetaLabel>{label}</MetaLabel>
      </dt>
      <dd className="font-mono text-h2 leading-none font-medium tracking-tight text-ink tabular-nums">{value}</dd>
    </div>
  );
}
